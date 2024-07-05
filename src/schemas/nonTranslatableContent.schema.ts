import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Elements } from 'src/interfaces/nonTranslatableContent.interface';
import { TranslatableContent } from './translatableContent.schema';
import { number, string } from 'joi';

export type NonTranslatableContentDocument = NonTranslatableContent & Document;

@Schema({ timestamps: true })
export class NonTranslatableContent {
  @Prop({
    type: Types.ObjectId,
    ref: 'TranslatableContent',
  })
  contentId: TranslatableContent[];
  @Prop({ required: true })
  fieldName: string;
  @Prop({ nullable: true })
  element: Elements[];
}

export const NonTranslatableContentSchema = SchemaFactory.createForClass(
  NonTranslatableContent,
);
