# Transport Order Manager

Planning and tracking of transport Orders carried out by the company's Trucks and Drivers.

## Language

### Orders

**Order** (_Zlecenie_):
A single transport job for a Customer: carried by one Truck and Driver, from Loading Places to Unloading Places, for an agreed price.
_Avoid_: Job, shipment, transport

**Order Number** (_Numer zlecenia_):
The Customer's reference for an Order. Unique per Customer: two Customers may use the same Order Number.
_Avoid_: Order id, reference

**Loading Date** (_Data załadunku_):
The day an Order's loading begins; the first day of the Order.
_Avoid_: Start date, from date

**Unloading Date** (_Data rozładunku_):
The day an Order's unloading ends; the last day of the Order.
_Avoid_: End date, delivery date

### Views

**Start date**
The filter, start of the range orders to fetch.

**End date**
The filter, end of the range orders to fetch.

**Orders Table** (_Zlecenia_):
The searchable, paginated list of all Orders, unrestricted by date unless the user filters it.
_Avoid_: Order list, orders page

**Timeline** (_Harmonogram_):
The one-Week view of every Order in that Week, laid out across days, used for planning Trucks and Drivers.
_Avoid_: Schedule, calendar, planner

**Week** (_Tydzień_):
Seven days from Monday to Sunday, identified by its year and Week Number (e.g. 2026-W44); the unit the Timeline shows.
_Avoid_: Period, range

**Week Number** (_Numer tygodnia_):
The ISO 8601 number of a Week within its year: Week 1 is the Week containing 4 January.
_Avoid_: Week index

**Order in a Week** (_Zlecenie w tygodniu_):
An Order with at least one day inside the Week (Start Date on or before Sunday and End Date on or after Monday). An Order crossing the Week's edge belongs to both Weeks.
_Avoid_: Weekly orders

**Order Day** (_Dzień zlecenia_):
What an Order does on one day of a Week: loading (Loading date), unloading (Unloading Date), both on the same day, transit (between them), or nothing. Monday is marked as continuing from the previous Week when the Order started earlier; Sunday as continuing into the next Week when it ends later.
_Avoid_: Day status, cell type
