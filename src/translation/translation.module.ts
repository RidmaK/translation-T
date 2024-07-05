import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  TranslatableContent,
  TranslatableContentSchema,
} from 'src/schemas/translatableContent.schema';
import { TranslationService } from './translation.service';
import { TranslationRepository } from 'src/repository/translation.repository';
import { TranslationController } from './translation.controller';
import {
  NonTranslatableContent,
  NonTranslatableContentSchema,
} from 'src/schemas/nonTranslatableContent.schema';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TranslatableContent.name, schema: TranslatableContentSchema },
      {
        name: NonTranslatableContent.name,
        schema: NonTranslatableContentSchema,
      },
    ]),
    HttpModule,
  ],
  controllers: [TranslationController],
  providers: [TranslationRepository, TranslationService],
})
export class TranslationModule {}
