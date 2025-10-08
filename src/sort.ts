import { ObjectOrType } from '@itrocks/class-type'
import { decorate }     from '@itrocks/decorator/class'
import { decoratorOf }  from '@itrocks/decorator/class'
import { Reverse }      from './reverse'

const SORT = Symbol('sort')

type PropertyPath = string | Reverse

export { Reverse }

export function Sort<T extends object>(...properties: PropertyPath[])
{
	return decorate<T>(SORT, properties.length ? properties : [])
}

export function sortOf<T extends object>(target: ObjectOrType<T>)
{
	return decoratorOf<PropertyPath[]>(target, SORT, [])
}
