// This is a simple API that can be hosted as a static file
// It provides the backend functionality for the frontend

// Mock data store (in production this would be replaced with Firebase Firestore)
let battles = [
  {
    id: '1',
    title: 'Epic Rap Battle',
    description: 'Show your lyrical skills',
    maxParticipants: 2,
    participants: [],
    status: 'waiting',
    createdAt: new Date().toISOString(),
    createdBy: 'system'
  }
];

let users = [];

// API endpoint handlers
const apiHandlers = {
  // Authentication endpoints
  'auth/signin': async (body) => {
    const { email, password } = body;
    
    // Simple mock authentication
    const user = { 
      id: Date.now().toString(), 
      email, 
      name: email.split('@')[0] 
    };
    
    return {
      success: true,
      message: 'Sign in successful',
      user
    };
  },

  'auth/signup': async (body) => {
    const { email, password, displayName } = body;
    
    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      throw new Error('User already exists');
    }
    
    const user = {
      id: Date.now().toString(),
      email,
      displayName: displayName || email.split('@')[0],
      createdAt: new Date().toISOString()
    };
    
    users.push(user);
    
    return {
      success: true,
      message: 'Account created successfully',
      user
    };
  },

  // Battle endpoints
  'battles/create': async (body) => {
    const { title, description, maxParticipants } = body;
    
    const battle = {
      id: Date.now().toString(),
      title: title || 'New Battle',
      description: description || '',
      maxParticipants: maxParticipants || 2,
      participants: [],
      status: 'waiting',
      createdAt: new Date().toISOString(),
      createdBy: 'system'
    };
    
    battles.push(battle);
    
    return {
      success: true,
      battleId: battle.id,
      message: 'Battle created successfully',
      battle
    };
  },

  'battles/list': async () => {
    return {
      success: true,
      battles: battles.slice().reverse(), // Most recent first
      count: battles.length
    };
  },

  'battles/join': async (body) => {
    const { battleId, userId } = body;
    
    const battle = battles.find(b => b.id === battleId);
    if (!battle) {
      throw new Error('Battle not found');
    }
    
    if (battle.participants.length >= battle.maxParticipants) {
      throw new Error('Battle is full');
    }
    
    if (battle.participants.includes(userId)) {
      throw new Error('Already joined this battle');
    }
    
    battle.participants.push(userId);
    
    if (battle.participants.length === battle.maxParticipants) {
      battle.status = 'active';
    }
    
    return {
      success: true,
      message: 'Joined battle successfully',
      battle
    };
  }
};

// Main API function
window.ViralViewsAPI = {
  async call(endpoint, method = 'GET', body = null) {
    try {
      if (method === 'POST' && apiHandlers[endpoint]) {
        const result = await apiHandlers[endpoint](body);
        return result;
      } else if (method === 'GET' && apiHandlers[endpoint]) {
        const result = await apiHandlers[endpoint]();
        return result;
      } else {
        throw new Error(`Endpoint ${endpoint} not found`);
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Convenience methods
  async signIn(email, password) {
    return this.call('auth/signin', 'POST', { email, password });
  },

  async signUp(email, password, displayName) {
    return this.call('auth/signup', 'POST', { email, password, displayName });
  },

  async createBattle(title, description, maxParticipants) {
    return this.call('battles/create', 'POST', { title, description, maxParticipants });
  },

  async getBattles() {
    return this.call('battles/list', 'GET');
  },

  async joinBattle(battleId, userId) {
    return this.call('battles/join', 'POST', { battleId, userId });
  }
};

// Battle management API for integration with existing components
window.BattleAPI = {
  async createBattle(title, description, maxParticipants = 2) {
    try {
      const result = await ViralViewsAPI.createBattle(title, description, maxParticipants);
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getBattles() {
    try {
      const result = await ViralViewsAPI.getBattles();
      return result.battles || [];
    } catch (error) {
      console.error('Failed to fetch battles:', error);
      return [];
    }
  },

  async joinBattle(battleId, userId) {
    try {
      const result = await ViralViewsAPI.joinBattle(battleId, userId);
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

console.log('Viral Views API initialized successfully');
