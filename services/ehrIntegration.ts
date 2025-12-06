
export interface EHRConfig {
  id: string;
  name: string;
  type: 'demo' | 'epic' | 'cerner';
}

export const ehrConfigs = {
  demo: { id: 'demo', name: 'Demo EHR', type: 'demo' },
  epic: { id: 'epic', name: 'Epic Systems', type: 'epic' },
  cerner: { id: 'cerner', name: 'Oracle Cerner', type: 'cerner' }
};

export class EHRIntegrationService {
  private config: any;

  constructor(config: any) {
    this.config = config;
  }

  getSystemInfo() {
    return {
      system: this.config.name,
      connected: false
    };
  }

  async authenticate() {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true;
  }

  async getPatient(id: string) {
    return { id, name: 'Test Patient' };
  }
}
