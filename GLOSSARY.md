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
A City an Order loads in, at most once per Order. An Order keeps its Loading Places in the order they were entered; the Timeline and the Orders Table show the first one, or none when it has none.
_Avoid_: Origin, pickup

**Unloading Place** (_Miejsce rozładunku_):
A City an Order unloads in, at most once per Order. An Order keeps its Unloading Places in the order they were entered; the Timeline and the Orders Table show the last one, or none when it has none.
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
A Truck's registration number; unique, so it identifies the Truck. It is written in capitals and digits only, without spaces or dashes, so _WND 8093A_ and _wnd-8093a_ are the same Plate. Searched for, in Search or the Order form's Truck field, a Plate is found with the typed text's spaces and dashes left out (_WND 28_ finds _WND2839C_).
_Avoid_: Registration, truck number

**Driver** (_Kierowca_):
A person who drives Orders. Known by first and last name, shown as "Jan Kowalski" and ordered by that name, first name first, in Polish alphabetical order. No two Drivers share both, a name being taken as it is for a Customer.
_Avoid_: Employee, chauffeur

**Regular Driver** (_Stały kierowca_):
The Driver who usually drives a Truck. An Order may still pair the Truck with a different Driver.
_Avoid_: Assigned driver, truck owner

### Customers and Cities

**Customer** (_Zleceniodawca_):
The company an Order is carried out for. Its name and its Tax Number are each unique: a Customer with either already taken cannot be created. A name is taken regardless of letter case and of repeated spaces, but Polish letters count (_Lodz_ is not _Łódź_); it keeps the spelling it was created with. Customers are ordered by name in Polish alphabetical order.
_Avoid_: Client, contractor

**Tax Number** (_NIP_):
A Customer's tax identifier: a Polish NIP (10 digits with a valid checksum) or a foreign VAT number (a country prefix other than PL followed by letters and digits). It is written in capitals without spaces, dashes or dots, and a Polish NIP without its PL prefix, so _PL 123-456-78-90_ and _1234567890_ are the same Tax Number.
_Avoid_: Tax id, VAT id

**City** (_Miejscowość_):
A place an Order loads or unloads in, with its postal code and country. Its name is unique: a City whose name is taken cannot be created, a name being taken as it is for a Customer. Cities are ordered by name in Polish alphabetical order, except that the Order form offers the Cities created from it first in both Places, newest first, until the user searches.
_Avoid_: Place, location, town (a Loading Place or Unloading Place is the role a City plays in an Order)

### Views

**Start date**
The filter, start of the range orders to fetch: it keeps Orders whose Start Date is on or after it.

**End date**
The filter, end of the range orders to fetch: it keeps Orders whose End Date is on or before it. Together the two keep only Orders wholly inside the range; an Order straddling either edge is left out, unlike an Order in a Week.

**Orders Table** (_Zlecenia_):
The searchable, paginated list of all Orders, unrestricted by date unless the user filters it.
_Avoid_: Order list, orders page

**Page** (_Strona_):
One run of the Orders Table's Orders, a Page Size long, in its sort. The Orders Table always shows a Page that exists: asked for one past the last, it shows the last; with no Orders matching, it shows one empty Page.
_Avoid_: Paging, offset

**Page Size** (_Wierszy na stronę_):
How many Orders a Page shows: 10, 20, 30, 40 or 50, 10 unless the user picks another.

**Search** (_Wyszukiwanie_):
The Orders Table's one free-text term. It matches an Order by any of its text columns (Order Number, Customer, Driver, Truck, Status, Currency, Loading and Unloading Cities), by its Plate with the term's spaces and dashes left out (_WND 2839C_ finds _WND2839C_), by a Price or PLN Price within 1 of it when it is a number, and by its Start or End Date when it is a calendar date (YYYY-MM-DD, DD-MM-YYYY, DD/MM/YYYY or DD.MM.YYYY); a date-shaped term that is no calendar date (31-02-2026) matches as text only.
_Avoid_: Global filter, query

**Reset** (_Reset_):
Returns the Orders Table to a view with no Search, no filters and no sort the user chose, back on its first Page and keeping its Page Size. A Search term typed but not yet applied is dropped with them.
_Avoid_: Clear filters, clear all

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
What an Order does on one day of a Week: loading (Loading date), unloading (Unloading Date), both on the same day, transit (between them), or nothing. Monday is marked as continuing from the previous Week when the Order started earlier; Sunday as continuing into the next Week when it ends later. It also carries what the Timeline shows that day: the Loading Place and the Customer on a loading day, the Unloading Place on an unloading day, and, in transit, the Loading Place on a continuing Monday and the Unloading Place on a continuing Sunday. Each Loading or Unloading Place shown carries its City's country.
_Avoid_: Day status, cell type
