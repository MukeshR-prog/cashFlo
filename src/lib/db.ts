import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  query,
  orderBy
} from "firebase/firestore";
import { app } from "./firebase";
import {
        mockMetrics,
        mockCashFlow,
        mockInvoices,
        mockAlerts,
        mockRevenueData,
        mockScenarioAssumptions,
        mockScenarioRunway,
        mockCapTable,
        mockDilutionScenario,
        mockComplianceAlerts,
} from "./mock-data";

export const db = app ? getFirestore(app) : null;

// Ensure database is initialized before calling these functions
const checkDb = () => {
    if (!db) throw new Error("Firestore is not initialized. Check your Firebase config.");
    return db;
};

// ==========================================
// 1. DATA SEEDING (One-time load for Hackathon)
// ==========================================
export async function seedUserData(userId: string) {
  const database = checkDb();
  const userRef = doc(database, "users", userId);

  try {
      // 1. Seed Metrics
      await setDoc(doc(userRef, "dashboard", "metrics"), mockMetrics);

      // 2. Seed Revenue
      await setDoc(doc(userRef, "dashboard", "revenue"), { data: mockRevenueData });

      // 3. Seed Cash Flow
      const cashFlowRef = collection(userRef, "cashflow");
      for (const item of mockCashFlow) {
          await setDoc(doc(cashFlowRef, item.date), item);
      }

      // 4. Seed Invoices
      const invoicesRef = collection(userRef, "invoices");
      for (const item of mockInvoices) {
          await setDoc(doc(invoicesRef, item.id), item);
      }

      // 5. Seed Alerts
      const alertsRef = collection(userRef, "alerts");
      for (const item of mockAlerts) {
          await setDoc(doc(alertsRef, item.id), item);
      }

      // 6. Seed Scenario Assumptions
      const scenarioAssumptionsRef = collection(userRef, "scenarioAssumptions");
      for (const item of mockScenarioAssumptions) {
          await setDoc(doc(scenarioAssumptionsRef, item.id), item);
      }

      // 7. Seed Scenario Runway
      const scenarioRunwayRef = collection(userRef, "scenarioRunway");
      for (const item of mockScenarioRunway) {
          await setDoc(doc(scenarioRunwayRef, item.month), item);
      }

      // 8. Seed Cap Table + Dilution Scenario
      const capTableRef = collection(userRef, "capTable");
      for (const item of mockCapTable) {
          await setDoc(doc(capTableRef, item.id), item);
      }
      await setDoc(doc(userRef, "capTable", "dilution"), mockDilutionScenario);

      // 9. Seed Compliance Alerts
      const complianceRef = collection(userRef, "compliance");
      for (const item of mockComplianceAlerts) {
          await setDoc(doc(complianceRef, item.id), item);
      }

      console.log("Seeding successful.");
      return true;
  } catch (error) {
      console.error("Firebase seeding failed. The database might be offline or lack permissions.", error);
      throw error;
  }
}

// ==========================================
// 2. DATA FETCHING (With Graceful Degradation to Mock Data)
// ==========================================

export async function getDashboardMetrics(userId: string) {
    try {
        const database = checkDb();
        const snap = await getDoc(doc(database, "users", userId, "dashboard", "metrics"));
        if (snap.exists()) return snap.data();
    } catch (error) {
        console.warn("Firestore fetch failed, falling back to mock metrics.", error);
    }
    return mockMetrics; // Graceful fallback
}

export async function getRevenueData(userId: string) {
    try {
        const database = checkDb();
        const snap = await getDoc(doc(database, "users", userId, "dashboard", "revenue"));
        if (snap.exists()) return snap.data().data;
    } catch (error) {
        console.warn("Firestore fetch failed, falling back to mock revenue.", error);
    }
    return mockRevenueData; // Graceful fallback
}

export async function getCashFlowData(userId: string) {
    try {
        const database = checkDb();
        const q = query(collection(database, "users", userId, "cashflow"), orderBy("date", "asc"));
        const snap = await getDocs(q);
        if (!snap.empty) return snap.docs.map(doc => doc.data());
    } catch (error) {
        console.warn("Firestore fetch failed, falling back to mock cashflow.", error);
    }
    return mockCashFlow; // Graceful fallback
}

export async function getInvoicesData(userId: string) {
    try {
        const database = checkDb();
        const snap = await getDocs(collection(database, "users", userId, "invoices"));
        if (!snap.empty) return snap.docs.map(doc => doc.data());
    } catch (error) {
        console.warn("Firestore fetch failed, falling back to mock invoices.", error);
    }
    return mockInvoices; // Graceful fallback
}

export async function getAlertsData(userId: string) {
    try {
        const database = checkDb();
        const snap = await getDocs(collection(database, "users", userId, "alerts"));
        if (!snap.empty) return snap.docs.map(doc => doc.data());
    } catch (error) {
        console.warn("Firestore fetch failed, falling back to mock alerts.", error);
    }
    return mockAlerts; // Graceful fallback
}

export async function getScenarioAssumptionsData(userId: string) {
    try {
        const database = checkDb();
        const snap = await getDocs(collection(database, "users", userId, "scenarioAssumptions"));
        if (!snap.empty) return snap.docs.map(doc => doc.data());
    } catch (error) {
        console.warn("Firestore fetch failed, falling back to mock scenario assumptions.", error);
    }
    return mockScenarioAssumptions;
}

export async function getScenarioRunwayData(userId: string) {
    try {
        const database = checkDb();
        const q = query(collection(database, "users", userId, "scenarioRunway"), orderBy("month", "asc"));
        const snap = await getDocs(q);
        if (!snap.empty) return snap.docs.map(doc => doc.data());
    } catch (error) {
        console.warn("Firestore fetch failed, falling back to mock scenario runway.", error);
    }
    return mockScenarioRunway;
}

export async function getCapTableData(userId: string) {
    try {
        const database = checkDb();
        const snap = await getDocs(collection(database, "users", userId, "capTable"));
        if (!snap.empty) return snap.docs.map(doc => doc.data());
    } catch (error) {
        console.warn("Firestore fetch failed, falling back to mock cap table.", error);
    }
    return mockCapTable;
}

export async function getDilutionScenarioData(userId: string) {
    try {
        const database = checkDb();
        const snap = await getDoc(doc(database, "users", userId, "capTable", "dilution"));
        if (snap.exists()) return snap.data();
    } catch (error) {
        console.warn("Firestore fetch failed, falling back to mock dilution scenario.", error);
    }
    return mockDilutionScenario;
}

export async function getComplianceAlertsData(userId: string) {
    try {
        const database = checkDb();
        const q = query(collection(database, "users", userId, "compliance"), orderBy("dueDate", "asc"));
        const snap = await getDocs(q);
        if (!snap.empty) return snap.docs.map(doc => doc.data());
    } catch (error) {
        console.warn("Firestore fetch failed, falling back to mock compliance alerts.", error);
    }
    return mockComplianceAlerts;
}

// ==========================================
// 3. DATA MUTATION (AR Workflows)
// ==========================================
export async function markInvoiceAsPaid(userId: string, invoiceId: string) {
    try {
        const database = checkDb();
        const invoiceRef = doc(database, "users", userId, "invoices", invoiceId);
        await setDoc(invoiceRef, { status: "paid" }, { merge: true });
        return true;
    } catch (error) {
        console.error("Firestore update failed. Simulating success for UI.", error);
        // Simulate network delay for the UI fallback
        await new Promise(resolve => setTimeout(resolve, 800));
        return true; 
    }
}
