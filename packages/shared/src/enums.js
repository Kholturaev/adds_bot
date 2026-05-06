"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanCode = exports.UserLanguage = exports.ImageStorageType = exports.FieldType = exports.AdStatus = void 0;
// Ad lifecycle statuses
var AdStatus;
(function (AdStatus) {
    AdStatus["DRAFT"] = "DRAFT";
    AdStatus["READY_FOR_REVIEW"] = "READY_FOR_REVIEW";
    AdStatus["PENDING_APPROVAL"] = "PENDING_APPROVAL";
    AdStatus["APPROVED"] = "APPROVED";
    AdStatus["PUBLISHED_PARTIAL"] = "PUBLISHED_PARTIAL";
    AdStatus["PUBLISHED_COMPLETE"] = "PUBLISHED_COMPLETE";
    AdStatus["REJECTED"] = "REJECTED";
    AdStatus["DELETED"] = "DELETED";
})(AdStatus || (exports.AdStatus = AdStatus = {}));
// Dynamic field types
var FieldType;
(function (FieldType) {
    FieldType["TEXT"] = "text";
    FieldType["NUMBER"] = "number";
    FieldType["SELECT"] = "select";
    FieldType["PHONE"] = "phone";
    FieldType["TELEGRAM"] = "telegram";
    FieldType["IMAGE"] = "image";
})(FieldType || (exports.FieldType = FieldType = {}));
// Image storage modes
var ImageStorageType;
(function (ImageStorageType) {
    ImageStorageType["DB"] = "db";
    ImageStorageType["URL"] = "url";
})(ImageStorageType || (exports.ImageStorageType = ImageStorageType = {}));
// Bot language (intro bilingual; rest is Uzbek only)
var UserLanguage;
(function (UserLanguage) {
    UserLanguage["UZ"] = "uz";
    UserLanguage["RU"] = "ru";
})(UserLanguage || (exports.UserLanguage = UserLanguage = {}));
// Well-known advertising plan codes
var PlanCode;
(function (PlanCode) {
    PlanCode["ONE_TIME"] = "one_time";
    PlanCode["TWO_TIMES_3_DAYS"] = "two_times_3_days";
    PlanCode["THREE_TIMES"] = "three_times";
})(PlanCode || (exports.PlanCode = PlanCode = {}));
//# sourceMappingURL=enums.js.map