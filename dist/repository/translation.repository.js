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
exports.TranslationRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const translatableContent_interface_1 = require("../interfaces/translatableContent.interface");
const nonTranslatableContent_schema_1 = require("../schemas/nonTranslatableContent.schema");
const translatableContent_schema_1 = require("../schemas/translatableContent.schema");
let TranslationRepository = class TranslationRepository {
    constructor(translatableContentModel, nonTranslatableContentDocument) {
        this.translatableContentModel = translatableContentModel;
        this.nonTranslatableContentDocument = nonTranslatableContentDocument;
    }
    async createTranslatableContent(entry) {
        const createdTranslatableContent = new this.translatableContentModel(entry);
        return await createdTranslatableContent.save();
    }
    async createNonTranslatableContent(entry) {
        const createdNonTranslatableContent = new this.nonTranslatableContentDocument(entry);
        return await createdNonTranslatableContent.save();
    }
    async findAll() {
        return this.translatableContentModel.find().exec();
    }
    async checkContentIdExisting(entryId) {
        return this.translatableContentModel.find({ contentId: entryId }).exec();
    }
    async updateTranslatableContent(entry) {
        console.log('entry.contentId', entry.contentId);
        return this.translatableContentModel.updateOne({
            contentId: entry.contentId,
            locale: entry.locale,
            status: { $ne: translatableContent_interface_1.Status.TRANSLATED },
        }, entry);
    }
};
TranslationRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(translatableContent_schema_1.TranslatableContent.name)),
    __param(1, (0, mongoose_1.InjectModel)(nonTranslatableContent_schema_1.NonTranslatableContent.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], TranslationRepository);
exports.TranslationRepository = TranslationRepository;
//# sourceMappingURL=translation.repository.js.map