
export class Reverse
{

	constructor(public property: string)
	{}

	toString()
	{
		return this.property
	}

}

export function reverse(property: string)
{
	return new Reverse(property)
}
