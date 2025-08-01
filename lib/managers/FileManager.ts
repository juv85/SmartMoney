// import * as FileSystem from "expo-file-system";
import RNFS from "react-native-fs";
import { Platform } from "react-native";

export interface ModelDownloadProgress {
  totalBytes: number;
  downloadedBytes: number;
  progress: number; // 0-1
}

export interface ModelInfo {
  name: string;
  version: string;
  size: number;
  url: string;
  localPath?: string;
  isDownloaded: boolean;
}

export class FileManager {
  private static instance: FileManager;
  private modelsDirectory: string;

  private constructor() {
    // Use different paths for iOS and Android
	if (Platform.OS === "ios") {
		console.log("test 1")
	  this.modelsDirectory = `${RNFS.DocumentDirectoryPath}/models/`;
	} else {
    console.log("test")
	  this.modelsDirectory = `${RNFS.ExternalStorageDirectoryPath}/Documents/`;
	}
  }

  static getInstance(): FileManager {
    if (!FileManager.instance) {
      FileManager.instance = new FileManager();
    }
    return FileManager.instance;
  }

  // Initialize models directory
  async initialize(): Promise<void> {
    try {
		const exists = await RNFS.exists(this.modelsDirectory);
		if (!exists) {
		  await RNFS.mkdir(this.modelsDirectory);
		  console.log("Models directory created:", this.modelsDirectory);
		}

    } catch (error) {
      console.error("Failed to initialize models directory:", error);
      throw error;
    }
  }

  // Download model from URL with progress tracking
  async downloadModel(
    modelUrl: string,
    fileName: string,
    onProgress?: (progress: ModelDownloadProgress) => void
  ): Promise<string> {
    try {
		const localPath = `${this.modelsDirectory}${fileName}`;
		const exists = await RNFS.exists(localPath);
		if (exists) return localPath;

		const downloadResult = await RNFS.downloadFile({
		  fromUrl: modelUrl,
		  toFile: localPath,
		  progress: (res) => {
			if (onProgress) {
			  onProgress({
				totalBytes: res.contentLength,
				downloadedBytes: res.bytesWritten,
				progress: res.bytesWritten / res.contentLength,
			  });
			}
		  },
		}).promise;

		if (downloadResult.statusCode === 200) return localPath;
		throw new Error(`Download failed with status: ${downloadResult.statusCode}`);
    } catch (error) {
      console.error("Model download failed:", error);
      throw error;
    }
  }

  // Copy model from app bundle to documents (for bundled models)
  async extractBundledModel(bundledAssetName: string): Promise<string> {
    try {
		const localPath = `${this.modelsDirectory}${bundledAssetName}`;
		const exists = await RNFS.exists(localPath);
		if (exists) return localPath;

		// NOTE: React Native doesn’t expose asset/bundle files to JS in Android directly.
		// You **cannot read Android assets from JS**, only via native code.
		// So for Android: this method is a NOOP unless you add a native asset copier.
		// You might want to skip this for Android.
		if (Platform.OS === "ios") {
		  const sourcePath = `${RNFS.MainBundlePath}/Assets/${bundledAssetName}`;
		  await RNFS.copyFile(sourcePath, localPath);
		  return localPath;
		} else {
		  throw new Error("Bundled model extraction not supported on Android from JS");
		}

    } catch (error) {
      console.error("Failed to extract bundled model:", error);
      throw error;
    }
  }

  // Get model file path if it exists
  async getModelPath(fileName: string): Promise<string | null> {
    try {
		const localPath = `${this.modelsDirectory}${fileName}`;
		const exists = await RNFS.exists(localPath);
		console.log("Checking existance: ", exists)
		return exists ? localPath : null;

    } catch (error) {
      console.error("Error checking model path:", error);
      return null;
    }
  }

  // Get information about a model file
  async getModelInfo(fileName: string): Promise<ModelInfo | null> {
    try {
		const localPath = `${this.modelsDirectory}${fileName}`;
		const exists = await RNFS.exists(localPath);
		if (!exists) return null;

		const stat = await RNFS.stat(localPath);
		return {
		  name: fileName,
		  version: "local",
		  size: Number(stat.size),
		  url: "",
		  localPath: localPath,
		  isDownloaded: true,
		};

    } catch (error) {
      console.error("Error getting model info:", error);
      return null;
    }
  }

  // List all downloaded models
  async listDownloadedModels(): Promise<ModelInfo[]> {
    try {
		const exists = await RNFS.exists(this.modelsDirectory);
		if (!exists) return [];

		const files = await RNFS.readDir(this.modelsDirectory);
		const taskFiles = files.filter(f => f.name.endsWith(".task"));

		const models: ModelInfo[] = [];
		for (const file of taskFiles) {
		  const modelInfo = await this.getModelInfo(file.name);
		  if (modelInfo) models.push(modelInfo);
		}
		return models;

    } catch (error) {
      console.error("Error listing models:", error);
      return [];
    }
  }

  // Delete a model file
  async deleteModel(fileName: string): Promise<boolean> {
    try {
		const localPath = `${this.modelsDirectory}${fileName}`;
		const exists = await RNFS.exists(localPath);
		if (exists) {
		  await RNFS.unlink(localPath);
		  return true;
		}
		return false;

    } catch (error) {
      console.error("Error deleting model:", error);
      return false;
    }
  }

  // Get available storage space
	async getAvailableSpace(): Promise<number> {
	  return 0; // You’d need a custom native module for this
	}

  /* async getAvailableSpace(): Promise<number> {
    try {
      const spaceInfo = await FileSystem.getFreeDiskStorageAsync();
      return spaceInfo;
    } catch (error) {
      console.error("Error getting available space:", error);
      return 0;
    }
  } */

  // Validate model file integrity (basic size check)
  async validateModel(
    fileName: string,
    expectedSize?: number
  ): Promise<boolean> {
    try {
      const modelInfo = await this.getModelInfo(fileName);
      if (!modelInfo) {
        return false;
      }

      // Basic validation - file exists and has reasonable size
      if (modelInfo.size < 1000000) {
        // Less than 1MB is probably not a valid model
        console.warn("Model file seems too small:", modelInfo.size);
        return false;
      }

      // Check expected size if provided
      if (expectedSize && Math.abs(modelInfo.size - expectedSize) > 1000000) {
        // 1MB tolerance
        console.warn(
          "Model size mismatch. Expected:",
          expectedSize,
          "Actual:",
          modelInfo.size
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error validating model:", error);
      return false;
    }
  }

  // Get models directory path
  getModelsDirectory(): string {
    return this.modelsDirectory;
  }
}
