# Overview production integration contract

The endpoint is not yet supplied. Configure `NEXT_PUBLIC_OVERVIEW_API_URL` and set `NEXT_PUBLIC_DASHBOARD_DATA_MODE=production` when it exists.

Request: `GET <endpoint>?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`, with `Accept: application/json`.

Required JSON fields are `total_customers`, `total_orders`, `revenue`, `average_order_value`, `repeat_customer_rate`, `cancellation_rate`, and optional `comparisons` containing the same six metric keys. Rates and comparisons are decimal ratios (`0.1667` means 16.67%). All metric fields may be `null` only when the complete dataset is unavailable; a partially-null response is treated as an invalid contract.

Still required from the backend team: endpoint URL, authentication mechanism, error envelope, timezone/date-boundary convention, currency, comparison-period definition, and confirmation of customer/order/cancellation business definitions.
