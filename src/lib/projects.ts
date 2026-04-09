export interface Project {
  id: string;
  name: string;
  model: string;
  systemPrompt: string;
  messages: { id: string; role: 'user' | 'assistant'; content: string }[];
}

export interface CustomModel {
  id: string;
  name: string;
  model: string;
  baseUrl: string;
  apiKey: string;
}

export function loadProjects(): Project[] {
  try {
    return JSON.parse(localStorage.getItem('ai-chat-projects') || '[]');
  } catch (error: unknown) {
    console.warn('Failed to load stored projects', error);
    return [];
  }
}

export function saveProjectsToStorage(projects: Project[]) {
  localStorage.setItem('ai-chat-projects', JSON.stringify(projects));
}

export function loadCustomModels(): CustomModel[] {
  try {
    return JSON.parse(localStorage.getItem('ai-chat-custom-models') || '[]');
  } catch (error: unknown) {
    console.warn('Failed to load stored custom models', error);
    return [];
  }
}

export function saveCustomModelsToStorage(models: CustomModel[]) {
  localStorage.setItem('ai-chat-custom-models', JSON.stringify(models));
}
