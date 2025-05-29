import Tflite from 'react-native-tflite';

const tflite = new Tflite();

export const loadModel = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    tflite.loadModel(
      {
        model: 'sentiment_model.tflite',
        numThreads: 1,
      },
      (err: any, res: any) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });
};

export const predictSentiment = (
  inputIds: number[],
  attentionMask: number[]
): Promise<any> => {
  return new Promise((resolve, reject) => {
    tflite.runModelOnBinary(
      {
        input: prepareInput(inputIds, attentionMask),
        // additional options can be configured here
      },
      (err: any, res: any) => {
        if (err) reject(err);
        else resolve(res);
      }
    );
  });
};

// You need to prepare this binary input as per the model's expectation
function prepareInput(inputIds: number[], attentionMask: number[]): number[] {
  // Flatten and normalize the inputs to match the model
  // This part depends on your TFLite input shape
  // For now just return inputIds
  return inputIds;
}
