/// <reference types="mongoose/types/aggregate" />
/// <reference types="mongoose/types/callback" />
/// <reference types="mongoose/types/collection" />
/// <reference types="mongoose/types/connection" />
/// <reference types="mongoose/types/cursor" />
/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/error" />
/// <reference types="mongoose/types/expressions" />
/// <reference types="mongoose/types/helpers" />
/// <reference types="mongoose/types/middlewares" />
/// <reference types="mongoose/types/indexes" />
/// <reference types="mongoose/types/models" />
/// <reference types="mongoose/types/mongooseoptions" />
/// <reference types="mongoose/types/pipelinestage" />
/// <reference types="mongoose/types/populate" />
/// <reference types="mongoose/types/query" />
/// <reference types="mongoose/types/schemaoptions" />
/// <reference types="mongoose/types/schematypes" />
/// <reference types="mongoose/types/session" />
/// <reference types="mongoose/types/types" />
/// <reference types="mongoose/types/utility" />
/// <reference types="mongoose/types/validation" />
/// <reference types="mongoose/types/virtuals" />
/// <reference types="mongoose/types/inferschematype" />
import { Document, Types } from 'mongoose';
import { Elements } from 'src/interfaces/nonTranslatableContent.interface';
import { TranslatableContent } from './translatableContent.schema';
export type NonTranslatableContentDocument = NonTranslatableContent & Document;
export declare class NonTranslatableContent {
    contentId: TranslatableContent[];
    fieldName: string;
    element: Elements[];
}
export declare const NonTranslatableContentSchema: import("mongoose").Schema<NonTranslatableContent, import("mongoose").Model<NonTranslatableContent, any, any, any, Document<unknown, any, NonTranslatableContent> & NonTranslatableContent & {
    _id: Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, NonTranslatableContent, Document<unknown, {}, import("mongoose").FlatRecord<NonTranslatableContent>> & import("mongoose").FlatRecord<NonTranslatableContent> & {
    _id: Types.ObjectId;
}>;
