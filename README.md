[![npm version](https://img.shields.io/npm/v/@itrocks/sort?logo=npm)](https://www.npmjs.org/package/@itrocks/sort)
[![npm downloads](https://img.shields.io/npm/dm/@itrocks/sort)](https://www.npmjs.org/package/@itrocks/sort)
[![GitHub](https://img.shields.io/github/last-commit/itrocks-ts/sort?color=2dba4e&label=commit&logo=github)](https://github.com/itrocks-ts/sort)
[![issues](https://img.shields.io/github/issues/itrocks-ts/sort)](https://github.com/itrocks-ts/sort/issues)
[![discord](https://img.shields.io/discord/1314141024020467782?color=7289da&label=discord&logo=discord&logoColor=white)](https://25.re/ditr)

# sort

Declare a default object sort order in your business classes.

*This documentation was written by an artificial intelligence and may contain errors or approximations.
It has not yet been fully reviewed by a human. If anything seems unclear or incomplete,
please feel free to contact the author of this package.*

## Installation

```bash
npm i @itrocks/sort
```

## Usage

### Minimal example

Use the `Sort` decorator on a business class to declare the default order in which
its instances should be sorted. The sort declaration is purely descriptive: it does
not sort anything by itself, but other libraries (for example `@itrocks/storage`
or an ORM / repository layer) can read it and apply the declared ordering.

```ts
import { Sort } from '@itrocks/sort'

@Sort('lastName', 'firstName')
class Person {
  constructor(
    public firstName: string,
    public lastName:  string
  ) {}
}
```

Any consumer that knows about `@itrocks/sort` can now call `sortOf(Person)` and
receive the declared sort description.

### Realistic end‑to‑end example

The following example shows how a data‑access layer such as `@itrocks/storage`
or `@itrocks/mysql` can use the declared sort order to build SQL `ORDER BY`
clauses. The example focuses on the part that concerns this package.

```ts
import { Reverse, Sort, sortOf } from '@itrocks/sort'

@Sort('lastName', new Reverse('createdAt'))
class Customer {
  constructor(
    public id:        number,
    public lastName:  string,
    public createdAt: Date
  ) {}
}

// Somewhere in your infrastructure code
function buildOrderBy<T extends object>(type: new (...args: any[]) => T): string {
  const properties = sortOf(type)
  if (!properties.length) return ''

  const clauses = properties.map(property => {
    if (property instanceof Reverse) {
      return '`' + property.property + '` DESC'
    }
    return '`' + property + '` ASC'
  })

  return 'ORDER BY ' + clauses.join(', ')
}

buildOrderBy(Customer)
//=> "ORDER BY `lastName` ASC, `createdAt` DESC"
```

Typical consumers do not need to know how `Sort` is implemented, only how to
declare the sort order and read it with `sortOf`.

## API

### `class Reverse`

Represents a property that should be sorted in descending order.

```ts
class Reverse {
  constructor(public property: string)
}
```

#### Constructor

- `property: string` – Name of the property on the decorated class to be sorted
  in reverse (descending) order.

You mainly use `Reverse` when declaring the sort order with `Sort`:

```ts
import { Reverse, Sort } from '@itrocks/sort'

@Sort('lastName', new Reverse('createdAt'))
class Customer {}
```

### `function Sort<T extends object>(...properties: PropertyPath[]): DecorateCaller<T>`

Class decorator factory used to declare the default sort order for a business class.

```ts
import { Reverse, Sort } from '@itrocks/sort'

type PropertyPath = string | Reverse

@Sort('lastName', new Reverse('createdAt'))
class Customer {}
```

#### Parameters

- `...properties: PropertyPath[]`
  - Each `PropertyPath` is either:
    - a `string` containing the name of a property used for sorting in ascending
      order, or
    - a `Reverse` instance identifying a property to sort in descending order.

If you pass an empty list of properties, the decorator still attaches
metadata, but consumers such as `sortOf` will see an empty array. In practice
you will almost always provide at least one property.

#### Returns

An instance of `DecorateCaller<T>` from `@itrocks/decorator/class`, suitable to
be used as a standard Typescript class decorator.

### `function sortOf<T extends object>(target: ObjectOrType<T>): PropertyPath[]`

Reads the sort metadata declared on a class or instance.

```ts
import { Reverse, Sort, sortOf } from '@itrocks/sort'

@Sort('lastName', new Reverse('createdAt'))
class Customer {}

const sort = sortOf(Customer)
// sort is: ['lastName', Reverse { property: 'createdAt' }]
```

#### Parameters

- `target: ObjectOrType<T>` – Either:
  - the constructor function of the decorated class, or
  - an instance of that class.

#### Returns

An array of `PropertyPath` objects (strings or `Reverse` instances) describing
the sort order declared with `Sort`. If the target has no sort declaration,
an empty array is returned.

## Typical use cases

- **Database repositories** – Define how entities should be ordered when no
  explicit `ORDER BY` is provided, then read the sort definition through
  `sortOf` to build SQL clauses (as done in `@itrocks/mysql`).
- **Generic storage layers** – In an abstraction such as `@itrocks/storage`,
  keep sorting rules close to the business classes and apply them uniformly
  across different back‑ends (SQL, in‑memory, etc.).
- **List or grid components** – Use `sortOf` when binding domain models to UI
  components that display lists or tables, and choose a default ordering
  without hard‑coding column names in the UI layer.
- **Shared conventions between modules** – Use `Sort` and `Reverse` in shared
  model libraries so that multiple services or applications agree on the same
  default ordering rules.
