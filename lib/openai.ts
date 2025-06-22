import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface PersonAnalysis {
  age: string;
  gender: string;
  skinTone: string;
  hairColor: string;
  hairStyle: string;
  facialFeatures: string;
  bodyType: string;
  height: string;
  distinctiveFeatures: string;
}

export const tennisActions = [
  'golpeando un potente forehand con forma perfecta',
  'celebrando un punto ganador con el puño en alto',
  'ejecutando un saque profesional con técnica impecable',
  'realizando una volea precisa en la red',
  'en posición atlética lista para devolver el servicio'
] as const;

export function getRandomTennisAction() {
  return tennisActions[Math.floor(Math.random() * tennisActions.length)];
}