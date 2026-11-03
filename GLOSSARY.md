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

**Loading Place** (_Miejsce załadunku_):
A City an Order loads in. The Timeline and the Orders Table show the Order's first one, or none when it has none.
_Avoid_: Origin, pickup

**Unloading Place** (_Miejsce rozładunku_):
A City an Order unloads in. The Timeline and the Orders Table show the Order's last one, or none when it has none.
_Avoid_: Destination, drop-off

**Status** (_Status zlecenia_):
Where an Order stands: in progress (_w trakcie_), cancelled (_anulowane_) or delivered (_zakończone_). Changing it touches nothing else on the Order.
_Avoid_: State, stage

### Prices

**Currency** (_Waluta_):
The currency an Order's Price is agreed in: PLN or a foreign one such as EUR.
_Avoid_: Money type

**Price** (_Cena w walucie_):
What the Customer pays for an Order, in the Order's Currency.
_Avoid_: Amount, rate, freight

**Exchange Rate** (_Kurs waluty_):
The NBP mid rate of a foreign Currency to PLN, from the latest business day before the Unloading Date and no later than today. A PLN Order has none.
_Avoid_: NBP rate, conversion rate

**PLN Price** (_Cena w PLN_):
An Order's Price in PLN: the Price itself for a PLN Order, otherwise the Price at its Exchange Rate, rounded to the grosz with half a grosz rounded up.
_Avoid_: Converted price, price in złoty

### Trucks and Drivers

**Truck** (_Pojazd_):
A company vehicle that carries Orders, known by its Plate. It may have a Regular Driver.
_Avoid_: Vehicle, car

**Plate** (_Numer rejestracyjny_):
A Truck's registration number; unique, so it identifies the Truck.
_Avoid_: Registration, truck number

**Driver** (_Kierowca_):
A person who drives Orders. Known by first and last name, shown as "Jan Kowalski" and ordered alphabetically by that name, first name first; no two Drivers share both.
_Avoid_: Employee, chauffeur

**Regular Driver** (_Stały kierowca_):
The Driver who usually drives a Truck. An Order may still pair the Truck with a different Driver.
_Avoid_: Assigned driver, truck owner

### Customers and Cities

**Customer** (_Zleceniodawca_):
The company an Order is carried out for. Its name and its tax number (_NIP_) are each unique: a Customer with either already taken cannot be created.
_Avoid_: Client, contractor

**City** (_Miejscowość_):
A place an Order loads or unloads in, with its postal code and country. Its name is unique: a City whose name is taken cannot be created.
_Avoid_: Place, location, town

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
What an Order does on one day of a Week: loading (Loading date), unloading (Unloading Date), both on the same day, transit (between them), or nothing. Monday is marked as continuing from the previous Week when the Order started earlier; Sunday as continuing into the next Week when it ends later. It also carries what the Timeline shows that day: the Loading Place and the Customer on a loading day, the Unloading Place on an unloading day, and, in transit, the Loading Place on a continuing Monday and the Unloading Place on a continuing Sunday.
_Avoid_: Day status, cell type
