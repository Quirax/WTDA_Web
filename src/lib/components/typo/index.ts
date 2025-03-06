import * as Tables from './table';
import Blockquote, { Class as BlockquoteClass } from './blockquote.svelte';
import Code, { Class as CodeClass } from './code.svelte';
import H1, { Class as H1Class } from './h1.svelte';
import H2, { Class as H2Class } from './h2.svelte';
import H3, { Class as H3Class } from './h3.svelte';
import H4, { Class as H4Class } from './h4.svelte';
import Large, { Class as LargeClass } from './large.svelte';
import Lead, { Class as LeadClass } from './lead.svelte';
import Muted, { Class as MutedClass } from './muted.svelte';
import P, { Class as PClass } from './p.svelte';
import Small, { Class as SmallClass } from './small.svelte';
import Ul, { Class as UlClass } from './ul.svelte';

const { Class: TableClass, ...Table } = Tables;

export { Table, Blockquote, Code, H1, H2, H3, H4, Large, Lead, Muted, P, Small, Ul };

export const Class = {
	Table: TableClass,
	Blockquote: BlockquoteClass,
	Code: CodeClass,
	H1: H1Class,
	H2: H2Class,
	H3: H3Class,
	H4: H4Class,
	Large: LargeClass,
	Lead: LeadClass,
	Muted: MutedClass,
	P: PClass,
	Small: SmallClass,
	Ul: UlClass
};
