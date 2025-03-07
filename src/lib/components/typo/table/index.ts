import Wrapper, { Class as WrapperClass } from './wrapper.svelte';
import Table, { Class as TableClass } from './table.svelte';
import Tr, { Class as TrClass } from './tr.svelte';
import Th, { Class as ThClass } from './th.svelte';
import Td, { Class as TdClass } from './td.svelte';

export { Wrapper, Table, Tr, Th, Td };

export const Class = {
	Wrapper: WrapperClass,
	Table: TableClass,
	Tr: TrClass,
	Th: ThClass,
	Td: TdClass
};
