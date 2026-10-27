# Transport Order Manager

Planning and tracking of transport Orders carried out by the company's Trucks and Drivers.

## Language

### Orders

**Order** (_Zlecenie_):
A single transport job for a Customer: carried by one Truck and Driver, from Loading Places to Unloading Places, for an agreed price.
_Avoid_: Job, shipment, transport

**Start Date** (_Data załadunku_):
The day an Order's loading begins; the first day of the Order.
_Avoid_: Loading date, from date

**End Date** (_Data rozładunku_):
The day an Order's unloading ends; the last day of the Order.
_Avoid_: Unloading date, delivery date

### Views

**Orders Table** (_Zlecenia_):
The searchable, paginated list of all Orders, unrestricted by date unless the user filters it.
_Avoid_: Order list, orders page

**Timeline** (_Harmonogram_):
The one-Week view of Orders laid out across days, used for planning Trucks and Drivers.
_Avoid_: Schedule, calendar, planner

**Week** (_Tydzień_):
Seven days from Monday to Sunday, identified by its Monday; the unit the Timeline shows.
_Avoid_: Period, range
