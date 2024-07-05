import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { filter } from 'rxjs';
import { Status } from '../interfaces/translatableContent.interface';
import {
  NonTranslatableContent,
  NonTranslatableContentDocument,
} from '../schemas/nonTranslatableContent.schema';
import {
  TranslatableContent,
  TranslatableContentDocument,
} from 'src/schemas/translatableContent.schema';

@Injectable()
export class TranslationRepository {
  constructor(
    @InjectModel(TranslatableContent.name)
    private translatableContentModel: Model<TranslatableContentDocument>,
    @InjectModel(NonTranslatableContent.name)
    private nonTranslatableContentDocument: Model<NonTranslatableContentDocument>,
  ) {}

  async createTranslatableContent(entry: any) {
    const createdTranslatableContent = new this.translatableContentModel(entry);
    return await createdTranslatableContent.save();
  }

  async createNonTranslatableContent(entry: any) {
    const createdNonTranslatableContent =
      new this.nonTranslatableContentDocument(entry);
    return await createdNonTranslatableContent.save();
  }

  async findAll(): Promise<TranslatableContentDocument[]> {
    return this.translatableContentModel.find().exec();
  }

  async checkContentIdExisting(entryId: any) {
    return this.translatableContentModel.find({ contentId: entryId }).exec();
  }

  async updateTranslatableContent(entry: any) {
    console.log('entry.contentId', entry.contentId);

    return this.translatableContentModel.updateOne(
      {
        contentId: entry.contentId,
        locale: entry.locale,
        status: { $ne: Status.TRANSLATED },
      },
      entry,
    );
  }
}
