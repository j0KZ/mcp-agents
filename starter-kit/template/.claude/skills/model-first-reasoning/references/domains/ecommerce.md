# Domain: Ecommerce & Inventory

Pre-defined patterns for ecommerce operations, inventory management, and multi-channel sales.

## Common Entity Types

```xml
<entity_types>
  <type name="SKU">
    <attributes>
      sku_id, name, cost, price, stock, min_stock, supplier, category
    </attributes>
  </type>
  
  <type name="Channel">
    <attributes>
      channel_id, name, fee_percentage, sync_delay, price_delta_allowed
    </attributes>
    <examples>shopify, mercadolibre, amazon, b2b_direct</examples>
  </type>
  
  <type name="Order">
    <attributes>
      order_id, channel, sku, quantity, status, created_at
    </attributes>
    <statuses>pending, confirmed, shipped, delivered, cancelled</statuses>
  </type>
  
  <type name="Supplier">
    <attributes>
      supplier_id, lead_time_days, min_order_qty, payment_terms
    </attributes>
  </type>
</entity_types>
```

## Common State Variables

| Variable | Domain | Description |
|----------|--------|-------------|
| `stock[sku]` | integer ≥ 0 | Current inventory units |
| `reserved[sku]` | integer ≥ 0 | Units allocated to pending orders |
| `available[sku]` | computed | stock - reserved |
| `price[sku, channel]` | decimal > 0 | Current price per channel |
| `cost[sku]` | decimal > 0 | Unit cost from supplier |
| `margin[sku, channel]` | percentage | (price - cost) / price |
| `revenue` | decimal | Accumulated sales |
| `pending_orders` | list | Orders awaiting fulfillment |

## Common Actions

### Inventory Actions

```xml
<action name="receive_stock">
  <parameters>sku, quantity, cost_per_unit</parameters>
  <preconditions>
    quantity > 0
    cost_per_unit > 0
  </preconditions>
  <effects>
    stock[sku] += quantity
    cost[sku] := weighted_average(old_cost, old_qty, cost_per_unit, quantity)
  </effects>
</action>

<action name="reserve_stock">
  <parameters>sku, quantity, order_id</parameters>
  <preconditions>
    available[sku] >= quantity
  </preconditions>
  <effects>
    reserved[sku] += quantity
    order[order_id].status := "confirmed"
  </effects>
</action>

<action name="ship_order">
  <parameters>order_id</parameters>
  <preconditions>
    order[order_id].status == "confirmed"
    reserved[order.sku] >= order.quantity
  </preconditions>
  <effects>
    stock[order.sku] -= order.quantity
    reserved[order.sku] -= order.quantity
    order[order_id].status := "shipped"
  </effects>
</action>
```

### Pricing Actions

```xml
<action name="update_price">
  <parameters>sku, channel, new_price</parameters>
  <preconditions>
    new_price > cost[sku]
    new_price within channel[channel].price_delta_allowed of base_price
  </preconditions>
  <effects>
    price[sku, channel] := new_price
    margin[sku, channel] := (new_price - cost[sku]) / new_price
  </effects>
</action>

<action name="sync_prices">
  <parameters>sku, source_channel, target_channel</parameters>
  <preconditions>
    price[sku, source_channel] is defined
  </preconditions>
  <effects>
    price[sku, target_channel] := price[sku, source_channel] * (1 + channel_fee_adjustment)
  </effects>
</action>
```

### Order Actions

```xml
<action name="create_order">
  <parameters>channel, sku, quantity, unit_price</parameters>
  <preconditions>
    available[sku] >= quantity
  </preconditions>
  <effects>
    new order_id created
    order[order_id] := {channel, sku, quantity, status: "pending"}
    revenue += quantity * unit_price * (1 - channel[channel].fee_percentage)
  </effects>
</action>

<action name="cancel_order">
  <parameters>order_id</parameters>
  <preconditions>
    order[order_id].status in ["pending", "confirmed"]
  </preconditions>
  <effects>
    if status == "confirmed": reserved[order.sku] -= order.quantity
    order[order_id].status := "cancelled"
  </effects>
</action>
```

## Common Constraints

```xml
<constraints>
  <!-- Inventory -->
  <invariant id="INV-1">stock[sku] >= 0 for all sku</invariant>
  <invariant id="INV-2">reserved[sku] <= stock[sku] for all sku</invariant>
  <invariant id="INV-3">stock[sku] >= min_stock[sku] (soft: trigger reorder if violated)</invariant>
  
  <!-- Pricing -->
  <invariant id="PRC-1">price[sku, channel] > cost[sku] * 1.05 (minimum 5% margin)</invariant>
  <invariant id="PRC-2">margin[sku, channel] >= target_margin[sku] (profitability)</invariant>
  <invariant id="PRC-3">|price[sku, ch1] - price[sku, ch2]| <= max_price_delta (channel parity)</invariant>
  
  <!-- Orders -->
  <invariant id="ORD-1">confirmed_orders require reserved_stock</invariant>
  <invariant id="ORD-2">shipped quantity <= reserved quantity</invariant>
  
  <!-- Financial -->
  <invariant id="FIN-1">cash_balance >= 0 (no overdraft)</invariant>
  <invariant id="FIN-2">total_revenue >= total_cost (profitability)</invariant>
</constraints>
```

## Multi-Channel Sync Pattern

When synchronizing between channels (e.g., Shopify ↔ MercadoLibre):

```xml
<problem_model task="price_sync">
  <entities>
    <entity name="product_X" type="SKU" cost="10000"/>
    <entity name="shopify" type="Channel" fee="0%" delta_allowed="0%"/>
    <entity name="meli" type="Channel" fee="13%" delta_allowed="15%"/>
  </entities>
  
  <state_variables>
    <variable name="price_shopify" initial="15000"/>
    <variable name="price_meli" initial="14500"/>
    <variable name="last_sync" initial="2025-01-01"/>
  </state_variables>
  
  <actions>
    <action name="sync_to_meli">
      <preconditions>
        new_price >= cost * 1.08  <!-- cover meli fee + margin -->
        |new_price - price_shopify| <= price_shopify * 0.15
      </preconditions>
      <effects>
        price_meli := new_price
        last_sync := now()
      </effects>
    </action>
  </actions>
  
  <constraints>
    <invariant>price_meli >= cost * 1.21</invariant>  <!-- 13% fee + 8% margin -->
    <invariant>price_shopify >= cost * 1.10</invariant>
  </constraints>
</problem_model>
```

## Common Failure Modes

1. **Overselling**: Creating orders when available < quantity (forgot to check reserved)
2. **Margin erosion**: Setting price without accounting for channel fees
3. **Sync conflicts**: Updating price on channel A while sync from B is in progress
4. **Stock phantom**: Showing stock that's actually reserved for other orders
