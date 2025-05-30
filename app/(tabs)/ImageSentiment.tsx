import React, { useState, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { launchImageLibrary, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import { TensorImage, torch, torchvision } from 'react-native-pytorch-core';

const MODEL_PATH = 'sentiment_model_mobile_optimized.ptl';
const IMAGE_SIZE = 224;
const NORMALIZATION_MEAN = [0.5, 0.5, 0.5];
const NORMALIZATION_STD = [0.5, 0.5, 0.5];

type Sentiment = 'Positive' | 'Neutral' | 'Negative';

interface SentimentResult {
  sentiment: Sentiment;
  confidence: number;
  timestamp: Date;
}

interface ImageSentimentProps {
  onResult?: (result: SentimentResult) => void;
}

export default function ImageSentiment({ onResult }: ImageSentimentProps) {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [result, setResult] = useState<SentimentResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState<any>(null);

  const sentimentLabels = useMemo<readonly Sentiment[]>(() => ['Negative', 'Neutral', 'Positive'], []);

  const sentimentConfig = useMemo(() => ({
    Positive: { color: '#4CAF50', emoji: '😊' },
    Neutral: { color: '#FF9800', emoji: '😐' },
    Negative: { color: '#F44336', emoji: '😞' }
  }), []);

  const loadModel = useCallback(async () => {
    try {
      if (!model) {
        const loadedModel = await torch.jit._loadForMobile(MODEL_PATH);
        setModel(loadedModel);
        return loadedModel;
      }
      return model;
    } catch (error) {
      console.error('Failed to load model:', error);
      Alert.alert('Error', 'Failed to load the sentiment analysis model');
      throw error;
    }
  }, [model]);

  const preprocessImage = useCallback(async (uri: string) => {
    try {
      const tensorImage = await TensorImage.fromImage(uri);
      const resized = torchvision.transforms.resize(tensorImage, [IMAGE_SIZE, IMAGE_SIZE]);
      const normalized = torchvision.transforms.normalize(
        resized, 
        NORMALIZATION_MEAN, 
        NORMALIZATION_STD
      );
      return normalized;
    } catch (error) {
      console.error('Image preprocessing failed:', error);
      throw new Error('Failed to process the image');
    }
  }, []);

  const runInference = useCallback(async (preprocessedImage: any, modelInstance: any) => {
    try {
      const output = await modelInstance.forward(preprocessedImage);
      const scores: number[] = output?.data();
      
      if (!scores || scores.length === 0) {
        throw new Error('Invalid model output');
      }

      const maxIdx = scores.indexOf(Math.max(...scores));
      const sentiment = sentimentLabels[maxIdx];
      const confidence = Math.round(scores[maxIdx] * 100 * 100) / 100; // Round to 2 decimal places

      return {
        sentiment,
        confidence,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Inference failed:', error);
      throw new Error('Failed to analyze sentiment');
    }
  }, [sentimentLabels]);

  const handlePickImage = useCallback(async (): Promise<void> => {
    try {
      const options = {
        mediaType: 'photo' as MediaType,
        quality: 0.8,
        maxWidth: 1024,
        maxHeight: 1024,
      };

      const response: ImagePickerResponse = await launchImageLibrary(options);

      if (response.didCancel || response.errorMessage) {
        if (response.errorMessage) {
          Alert.alert('Error', response.errorMessage);
        }
        return;
      }

      if (!response.assets?.length) {
        Alert.alert('Error', 'No image selected');
        return;
      }

      const uri = response.assets[0].uri;
      if (!uri) {
        Alert.alert('Error', 'Invalid image selected');
        return;
      }

      setImageUri(uri);
      setResult(null);
      setIsLoading(true);

      // Process image and run inference
      const [preprocessedImage, modelInstance] = await Promise.all([
        preprocessImage(uri),
        loadModel()
      ]);

      const sentimentResult = await runInference(preprocessedImage, modelInstance);
      
      setResult(sentimentResult);
      onResult?.(sentimentResult);

    } catch (error) {
      console.error('Image analysis failed:', error);
      Alert.alert(
        'Analysis Failed', 
        error instanceof Error ? error.message : 'An unexpected error occurred'
      );
    } finally {
      setIsLoading(false);
    }
  }, [preprocessImage, loadModel, runInference, onResult]);

  const handleClearImage = useCallback(() => {
    setImageUri(null);
    setResult(null);
  }, []);

  const renderResult = () => {
    if (!result) return null;

    const config = sentimentConfig[result.sentiment];
    
    return (
      <View style={styles.resultContainer}>
        <Text style={[styles.emoji, { color: config.color }]}>
          {config.emoji}
        </Text>
        <Text style={[styles.sentiment, { color: config.color }]}>
          {result.sentiment}
        </Text>
        <Text style={styles.confidence}>
          Confidence: {result.confidence}%
        </Text>
        <Text style={styles.timestamp}>
          Analyzed: {result.timestamp.toLocaleTimeString()}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <View style={styles.container}>
        <Text style={styles.title}>Image Sentiment Analysis</Text>
        
        <TouchableOpacity 
          style={[styles.button, isLoading && styles.buttonDisabled]} 
          onPress={handlePickImage}
          disabled={isLoading}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Analyzing...' : 'Pick an Image'}
          </Text>
        </TouchableOpacity>

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Processing image...</Text>
          </View>
        )}

        {imageUri && !isLoading && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: imageUri }} style={styles.image} />
            <TouchableOpacity 
              style={styles.clearButton} 
              onPress={handleClearImage}
            >
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          </View>
        )}

        {renderResult()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 20,
    minWidth: 200,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 14,
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  image: {
    width: 250,
    height: 250,
    borderRadius: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  clearButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 15,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  resultContainer: {
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    minWidth: 200,
  },
  emoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  sentiment: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  confidence: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
});
