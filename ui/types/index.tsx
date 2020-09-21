/*
 * Core API types
 */

export type FrameRef = {
  id: number;
  src: string;
  liked: boolean;
  vId: number;
  sId: number;
};

export type Vec2 = { x: number; y: number };

export type CoreApiSettings = any;
