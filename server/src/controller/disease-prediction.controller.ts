import type { Request, Response } from "express";
import z from "zod";
import {
  brainTumorPredictionService,
  tuberculosisPredictionService,
  diabetesPredictionService,
  heartDiseasePredictionService,
  diseasePredictionService,
} from "../services/disease-prediction.service";

const PredictRequestSchema = z.object({
  symptoms: z.preprocess((value) => {
    if (Array.isArray(value) && value.length === 1 && Array.isArray(value[0])) {
      return value[0];
    }
    return value;
  }, z.array(z.string().min(1)).min(1)),
});

const HeartDiseasePredictSchema = z.object({
  gender: z.union([z.string(), z.number()]),
  smoking_history: z.union([z.string(), z.number()]),
  age: z.union([z.string(), z.number()]),
  bmi: z.union([z.string(), z.number()]),
  HbA1c_level: z.union([z.string(), z.number()]),
  blood_glucose_level: z.union([z.string(), z.number()]),
  hypertension: z.union([z.string(), z.number(), z.boolean()]),
  heart_disease: z.union([z.string(), z.number(), z.boolean()]),
});

const DiabetesPredictSchema = z.object({
  Pregnancies: z.union([z.string(), z.number()]),
  Glucose: z.union([z.string(), z.number()]),
  BloodPressure: z.union([z.string(), z.number()]),
  SkinThickness: z.union([z.string(), z.number()]),
  Insulin: z.union([z.string(), z.number()]),
  BMI: z.union([z.string(), z.number()]),
  DiabetesPedigreeFunction: z.union([z.string(), z.number()]),
  Age: z.union([z.string(), z.number()]),
});

function getUserId(req: Request): string | null {
  const authUser = req.user as { _id?: unknown; id?: string } | undefined;
  const id = authUser?.id ?? authUser?._id;
  if (!id) return null;
  return String(id);
}

export class DiseasePredictionController {
  async predict(req: Request, res: Response) {
    try {
      const parsed = PredictRequestSchema.safeParse(req.body ?? {});
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsed.error),
        });
      }

      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const result = await diseasePredictionService.predict(
        userId,
        parsed.data.symptoms,
      );

      return res.status(200).json({
        success: true,
        data: result,
        message: "Prediction generated",
      });
    } catch (error: Error | any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async predictHeartDisease(req: Request, res: Response) {
    try {
      const parsed = HeartDiseasePredictSchema.safeParse(req.body ?? {});
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsed.error),
        });
      }

      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const result = await heartDiseasePredictionService.predict(
        userId,
        parsed.data,
      );
      return res.status(200).json({
        success: true,
        data: result,
        message: "Heart disease prediction generated",
      });
    } catch (error: Error | any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async predictDiabetes(req: Request, res: Response) {
    try {
      const parsed = DiabetesPredictSchema.safeParse(req.body ?? {});
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsed.error),
        });
      }

      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const result = await diabetesPredictionService.predict(
        userId,
        parsed.data,
      );
      return res.status(200).json({
        success: true,
        data: result,
        message: "Diabetes prediction generated",
      });
    } catch (error: Error | any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async predictBrainTumor(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const file = req.file;
      if (!file) {
        return res.status(400).json({
          success: false,
          message: "Image file is required",
        });
      }

      const result = await brainTumorPredictionService.predict(
        userId,
        file.buffer,
      );

      return res.status(200).json({
        success: true,
        data: result,
        message: "Brain tumor prediction generated",
      });
    } catch (error: Error | any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async predictTuberculosis(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const file = req.file;
      if (!file) {
        return res.status(400).json({
          success: false,
          message: "Image file is required",
        });
      }

      const result = await tuberculosisPredictionService.predict(
        userId,
        file.buffer,
      );

      return res.status(200).json({
        success: true,
        data: result,
        message: "Tuberculosis prediction generated",
      });
    } catch (error: Error | any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}
