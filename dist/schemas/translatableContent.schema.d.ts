import mongoose from 'mongoose';
import { Status, TranslatableContentFields } from 'src/interfaces/translatableContent.interface';
export type TranslatableContentDocument = TranslatableContent & Document;
export declare class TranslatableContent {
    contentId: string;
    fields: TranslatableContentFields[];
    status: Status;
    locale: string;
}
export declare const TranslatableContentSchema: mongoose.Schema<TranslatableContent, mongoose.Model<TranslatableContent, any, any, any, mongoose.Document<unknown, any, TranslatableContent> & TranslatableContent & {
    _id: mongoose.Types.ObjectId;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, TranslatableContent, mongoose.Document<unknown, {}, mongoose.FlatRecord<TranslatableContent>> & mongoose.FlatRecord<TranslatableContent> & {
    _id: mongoose.Types.ObjectId;
}>;
