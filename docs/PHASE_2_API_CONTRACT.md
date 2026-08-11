# Phase 2 production API contract

Both endpoints are currently missing. They must accept `GET ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`.

## Customer Type

Configure `NEXT_PUBLIC_CUSTOMER_TYPE_API_URL`. Response fields: `daily[]` with `date`, `new_customers`, and `existing_customers`; `revenue_contribution[]` with `customer_type` (`new` or `returning`), `revenue`, and `revenue_contribution`; and `percentage_format` (`ratio` or `percent`). A `null` dataset means unavailable; an empty array means available but empty. Classification must be performed by the backend.

## Purchase Time

Configure `NEXT_PUBLIC_PURCHASE_TIME_API_URL`. Response fields: ordered `weekdays[]`, ordered `time_slots[]`, `time_slot_totals[]` with `weekday`, `time_slot`, and `total_orders`, `weekday_totals[]` with `weekday` and `total_orders`, and `omitted_combination_means_zero`. Missing grid cells are filled with zero only when that final flag is `true`.

Still required: endpoint URLs, authentication, error envelopes, timezone/date boundaries, data freshness metadata, confirmed Monday–Sunday labels, approved time-slot strings, and confirmation that omitted heatmap cells mean zero or unknown.
