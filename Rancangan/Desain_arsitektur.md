flowchart TB
    subgraph Frontend
        A[React SPA] --> B[React Router]
        A --> C[React Context / Zustand]
        A --> D[Chart.js for Analytics]
        A --> E[UI Components]
    end

    subgraph Backend
        F[Laravel API] --> G[Authentication]
        F --> H[Business Logic]
        F --> I[Database Layer]
        F --> J[Queue System]
    end

    subgraph Database
        K[MySQL] --> L[Program Kerja Tables]
        K --> M[User Management]
        K --> N[Audit Logs]
    end

    subgraph External
        O[Email Service]
        P[Slack Integration]
        Q[File Storage]
    end

    A <--> F
    F <--> K
    F <--> O
    F <--> P
    F <--> Q
    
    style A fill:#e1f5fe
    style F fill:#f3e5f5
    style K fill:#fff3e0