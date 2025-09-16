import Footer from '../components/layout/Footer';
import TriageOverview from '../components/triage/TriageOverview';
import PatientList from '../components/triage/PatientList';
import { patients } from '../data/mockData';

const TriageManagement = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container mx-auto px-4 py-6">
        <h1 className="text-4xl font-bold mb-6" style={{ color: '#3D3D3D' }}>Patient Triage Management</h1>
        <TriageOverview />
        <PatientList patients={patients} />
      </main>
      <Footer />
    </div>
  );
};

export default TriageManagement;
