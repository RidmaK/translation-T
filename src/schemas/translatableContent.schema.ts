import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import {
  Status,
  TranslatableContentFields,
} from 'src/interfaces/translatableContent.interface';

export type TranslatableContentDocument = TranslatableContent & Document;

@Schema({ timestamps: true })
export class TranslatableContent {
  @Prop({ required: true })
  contentId: string;
  @Prop({ required: true })
  fields: TranslatableContentFields[];
  @Prop({ required: true, enum: Status, default: Status.PENDING })
  status: Status;
  @Prop()
  locale: string;
}

export const TranslatableContentSchema =
  SchemaFactory.createForClass(TranslatableContent);
