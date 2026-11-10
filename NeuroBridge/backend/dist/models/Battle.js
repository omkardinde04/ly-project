"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const playerSchema = new mongoose_1.Schema({
    userId: { type: String, required: true },
    displayName: { type: String, required: true },
    rating: { type: Number, required: true },
    ability: { type: Number, min: 1, max: 4, default: 2.5 },
    correct: { type: Number, default: 0 },
    index: { type: Number, default: 0 },
    responses: {
        type: [{ questionId: String, selectedOption: Number, correct: Boolean }],
        default: [],
    },
    finishedAt: { type: Date },
    ratingChange: { type: Number },
}, { _id: false });
function legacyQuestionLimit() {
    return this.questions.length || 8;
}
const BattleSchema = new mongoose_1.Schema({
    matchId: { type: String, required: true, unique: true, index: true },
    skill: { type: String, required: true },
    questions: [{
            id: { type: String, default: () => new mongoose_1.default.Types.ObjectId().toString() },
            prompt: String,
            options: [String],
            answer: Number,
            difficulty: { type: Number, default: 2 },
        }],
    questionLimit: { type: Number, required: true, default: legacyQuestionLimit },
    players: { type: [playerSchema], required: true },
    status: { type: String, enum: ['countdown', 'active', 'complete'], default: 'countdown' },
    startedAt: { type: Date, required: true },
    completedAt: { type: Date },
}, { timestamps: true, optimisticConcurrency: true });
exports.default = mongoose_1.default.model('Battle', BattleSchema);
