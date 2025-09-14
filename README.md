# Haven

Haven is a real-time collaborative virtual workspace platform that enables remote teams to work together in interactive 2D virtual environments. The platform combines virtual office spaces, collaborative tools, and project management features into a unified digital workspace.

## Demo

https://github.com/user-attachments/assets/f0f45e59-6d70-426e-b8ca-c1814b801222

## Core Features

### Virtual 2D Office Spaces

- **Interactive Virtual Environment**: 2D virtual office spaces powered by Phaser game engine with collision detection and player movement
- **Real-time Player Synchronization**: Live player position updates and presence awareness across all connected clients
- **Animated Player Avatars**: Sprite-based player characters with directional movement animations
- **Status Indicators**: Visual status representation (online, away, meeting, do not disturb) with real-time updates

<div align="center">
  <img src="https://github.com/user-attachments/assets/cfb7a5ca-1d93-43c9-b600-490240b6517d" alt="Virtual Office Space" height="300"/>
  <img src="https://github.com/user-attachments/assets/bb63e2cd-75b6-4eb0-be70-9fdc7fed2a39" alt="Player Avatars" height="300"/>
</div>

### Real-time Communication Infrastructure

- **WebSocket Integration**: Native WebSocket connections for real-time bidirectional communication
- **Redis Pub/Sub Architecture**: Distributed message broadcasting across multiple server instances using Redis channels
- **Rate-Limited Updates**: Optimized position update frequency to prevent network congestion
- **Real-time Chat System**: In-space messaging with persistent chat history

<div align="center">
  <img src="https://github.com/user-attachments/assets/7b3260fb-d30c-4bfa-945f-926e0aaf8d04" alt="Real-time Chat"/>
</div>

### Collaborative Whiteboard

- **Excalidraw Integration**: Full-featured collaborative drawing canvas with real-time synchronization
- **Debounced Persistence**: 3-second debounced saving mechanism to optimize database writes while maintaining data consistency
- **Multi-user Collaboration**: Simultaneous editing support with conflict resolution and change detection
- **PNG Export Functionality**: Export whiteboard content as high-quality PNG images

<div align="center">
  <img src="https://github.com/user-attachments/assets/2e7d265d-f8eb-4292-90c8-5fd23a3588f7" alt="Collaborative Whiteboard" style={{ maxWidth: '80%', height: 'auto', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }} />
</div>

### Project Management

- **Kanban Board System**: Task management with drag-and-drop functionality across customizable workflow columns
- **Task Priority System**: Color-coded priority indicators (HIGH/MEDIUM/LOW) with visual urgency indicators
- **Space-scoped Tasks**: All tasks are associated with specific collaborative workspaces

<div align="center">
  <img src="https://github.com/user-attachments/assets/46f58c47-c875-4ec5-a749-ce3a14700f16" alt="Kanban Board" style={{ maxWidth: '75%', height: 'auto', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }} />
</div>

### Authentication & Security

- **Google OAuth Integration**: Complete OAuth 2.0 authentication flow with Google identity provider
- **JWT Token Management**: Secure session management using JWT tokens stored in HTTP-only cookies
- **Protected Routes**: Comprehensive route protection with authentication middleware

<div align="center">
  <img src="https://github.com/user-attachments/assets/3f55130d-4946-48af-8ea9-8def4562af0b" alt="Authentication" style={{ maxWidth: '60%', height: 'auto', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }} />
</div>

### Space Management

- **Workspace Creation**: Create and configure team collaborative spaces
- **Space Joining**: Join existing spaces through invitation system
- **Member Management**: Track space membership and user participation

<div style={{ textAlign: 'center', margin: '20px 0' }}>
  <img src="https://github.com/user-attachments/assets/2bc701b7-5a25-4ac0-86ba-f10990354e0d" alt="Space Management" style={{ maxWidth: '65%', height: 'auto', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }} />
</div>

---

## Technical Architecture

### Backend Stack

- **Go with Fiber Framework**: High-performance HTTP web framework for RESTful API endpoints
- **PostgreSQL with GORM**: Relational database with object-relational mapping for data persistence
- **Redis Integration**: In-memory data store for real-time communication and session caching
- **WebSocket Server**: Native WebSocket implementation for real-time features

### Frontend Stack

- **React with TypeScript**: Component-based UI with static typing for enhanced development experience
- **Phaser Game Engine**: 2D game engine (version 3.88.2) for interactive virtual environments

### Real-time Communication Channels

| Channel | Purpose |
|---------|---------|
| `game:positions` | Player position synchronization across virtual spaces |
| `game:events` | Player join/leave events and space state changes |
| `game:chat` | Real-time chat message distribution |
| `whiteboard:updates` | Collaborative whiteboard element synchronization |
| `user:status_updates` | User presence and status change notifications |
