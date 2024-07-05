import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { TranslationService } from './translation.service';
import * as path from 'path';
import * as fs from 'fs';
import { Response } from 'express';

@Controller('translations')
export class TranslationController {
  constructor(private translationService: TranslationService) {}

  @Post()
  async createTranslatableContent(@Body() createTranslatableContentDto: any) {
    const { event, model, entry } = createTranslatableContentDto;
    console.log('🌃event = ${event}, 🧪model = ${model}');
    if (model === 'blog') {
      return this.translationService.createOrUpdateTranslatableContent(entry);
    }
  }

  @Get('get-all')
  async getAllTranslatableContent() {
    return await this.translationService.getAllTranslatableContent();
  }

  @Get('translate-all')
  async translateAllContent() {
    return await this.translationService.translateAllContent();
  }
  @Get('logs')
  getLogs(@Res() res: Response) {
    const logFilePath = path.join(__dirname, '../../ai_translation_log.txt');

    fs.readFile(logFilePath, 'utf8', (err, data) => {
      if (err) {
        return res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .send('Error reading log file');
      }
      res.send(data);
    });
  }

  @Get('error-logs')
  getTranslations(@Res() res: Response) {
    const logFilePath = path.join(
      __dirname,
      '../../ai_translation_error_log.txt',
    );

    fs.readFile(logFilePath, 'utf8', (err, data) => {
      if (err) {
        return res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .send('Error reading log file');
      }
      res.send(data);
    });
  }
}
