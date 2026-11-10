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
const AdaptivePracticeRunSchema = new mongoose_1.Schema({
    userId: { type: String, required: true, index: true },
    skill: { type: String, enum: ['sound', 'focus', 'memory', 'speed'], required: true },
    status: { type: String, enum: ['active', 'complete', 'abandoned'], default: 'active' },
    questions: [{
            id: { type: String, required: true },
            prompt: { type: String, required: true },
            options: { type: [String], required: true },
            answer: { type: Number, required: true },
            difficulty: { type: Number, required: true },
        }],
    responses: [{
            questionId: { type: String, required: true },
            selectedOption: { type: Number, required: true },
            correct: { type: Boolean, required: true },
        }],
    ability: { type: Number, min: 1, max: 4, required: true },
    questionLimit: { type: Number, required: true },
}, { timestamps: true, optimisticConcurrency: true });
exports.default = mongoose_1.default.model('AdaptivePracticeRun', AdaptivePracticeRunSchema);
