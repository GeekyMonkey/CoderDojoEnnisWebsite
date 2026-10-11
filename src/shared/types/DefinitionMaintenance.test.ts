import { describe, expect, it } from "vitest";
import { definitionFieldsSchema, definitionUpdateSchema, definitionDeleteSchema, newDefinition, definitionSnapshot, type DefinitionFields } from "./DefinitionMaintenance";
/** Verify protected fields, kind constraints and exact optimistic snapshots. */
describe("achievement definition contracts", (): void => {
 const belt: DefinitionFields = { ...definitionSnapshot(newDefinition("belt")), name:" Test belt ",description:"" };
 it("normalizes optional text and trims names", (): void => { expect(definitionFieldsSchema("belt").parse(belt)).toEqual({...belt,name:"Test belt",description:null}); });
 it("rejects protected fields and invalid belt values", (): void => { expect(definitionFieldsSchema("belt").safeParse({...belt,deleted:true}).success).toBe(false); expect(definitionFieldsSchema("belt").safeParse({...belt,sortOrder:0.5}).success).toBe(false); expect(definitionFieldsSchema("belt").safeParse({...belt,hexCode:"red"}).success).toBe(false); });
 it("requires an active-category identity for badge inputs", (): void => { expect(definitionFieldsSchema("badge").safeParse({...definitionSnapshot(newDefinition("badge")),name:"Badge"}).success).toBe(false); });
 it("rejects fields from another definition kind", (): void => { expect(definitionFieldsSchema("category").safeParse({...belt,name:"Category"}).success).toBe(false); });
 it("requires complete snapshots for edits and deletes", (): void => { expect(definitionUpdateSchema("belt").safeParse({fields:belt}).success).toBe(false); expect(definitionDeleteSchema.safeParse({expected:{name:"Test belt"}}).success).toBe(false); });
});
