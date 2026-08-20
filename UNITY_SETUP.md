# Unity support

This repository contains the existing web/TypeScript workspace plus a native Unity 6 client at the repository root.

## Open in Unity

Open the repository root (`loli_game`) from Unity Hub. Unity detects the project from `ProjectSettings/ProjectVersion.txt` and `Packages/manifest.json`.

The existing Replit/Bolt workspace remains in place and is not replaced.

## Runtime bridge

`LoliGameBootstrap` is the native Unity entry point. It keeps the Unity client running in the background and exposes a configurable backend health URL for the shared server integration.
