"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TranslationModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const translatableContent_schema_1 = require("../schemas/translatableContent.schema");
const translation_service_1 = require("./translation.service");
const translation_repository_1 = require("../repository/translation.repository");
const translation_controller_1 = require("./translation.controller");
const nonTranslatableContent_schema_1 = require("../schemas/nonTranslatableContent.schema");
const axios_1 = require("@nestjs/axios");
let TranslationModule = class TranslationModule {
};
TranslationModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: translatableContent_schema_1.TranslatableContent.name, schema: translatableContent_schema_1.TranslatableContentSchema },
                {
                    name: nonTranslatableContent_schema_1.NonTranslatableContent.name,
                    schema: nonTranslatableContent_schema_1.NonTranslatableContentSchema,
                },
            ]),
            axios_1.HttpModule,
        ],
        controllers: [translation_controller_1.TranslationController],
        providers: [translation_repository_1.TranslationRepository, translation_service_1.TranslationService],
    })
], TranslationModule);
exports.TranslationModule = TranslationModule;
//# sourceMappingURL=translation.module.js.map