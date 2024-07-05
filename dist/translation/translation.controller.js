"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TranslationController = void 0;
const common_1 = require("@nestjs/common");
const translation_service_1 = require("./translation.service");
const path = require("path");
const fs = require("fs");
let TranslationController = class TranslationController {
    constructor(translationService) {
        this.translationService = translationService;
    }
    async createTranslatableContent(createTranslatableContentDto) {
        const { event, model, entry } = createTranslatableContentDto;
        console.log('🌃event = ${event}, 🧪model = ${model}');
        if (model === 'blog') {
            return this.translationService.createOrUpdateTranslatableContent(entry);
        }
    }
    async getAllTranslatableContent() {
        return await this.translationService.getAllTranslatableContent();
    }
    async translateAllContent() {
        return await this.translationService.translateAllContent();
    }
    getLogs(res) {
        const logFilePath = path.join(__dirname, '../../ai_translation_log.txt');
        fs.readFile(logFilePath, 'utf8', (err, data) => {
            if (err) {
                return res
                    .status(common_1.HttpStatus.INTERNAL_SERVER_ERROR)
                    .send('Error reading log file');
            }
            res.send(data);
        });
    }
    getTranslations(res) {
        const logFilePath = path.join(__dirname, '../../ai_translation_error_log.txt');
        fs.readFile(logFilePath, 'utf8', (err, data) => {
            if (err) {
                return res
                    .status(common_1.HttpStatus.INTERNAL_SERVER_ERROR)
                    .send('Error reading log file');
            }
            res.send(data);
        });
    }
};
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TranslationController.prototype, "createTranslatableContent", null);
__decorate([
    (0, common_1.Get)('get-all'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TranslationController.prototype, "getAllTranslatableContent", null);
__decorate([
    (0, common_1.Get)('translate-all'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TranslationController.prototype, "translateAllContent", null);
__decorate([
    (0, common_1.Get)('logs'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TranslationController.prototype, "getLogs", null);
__decorate([
    (0, common_1.Get)('error-logs'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TranslationController.prototype, "getTranslations", null);
TranslationController = __decorate([
    (0, common_1.Controller)('translations'),
    __metadata("design:paramtypes", [translation_service_1.TranslationService])
], TranslationController);
exports.TranslationController = TranslationController;
//# sourceMappingURL=translation.controller.js.map