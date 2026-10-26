import AdminPage from './components/AdminPage';
import { AdminModalProvider } from '@/contexts/AdminModalContext';

export default function Admin(){
    return(
        <AdminModalProvider>
            {/* <NavigationMenuDemo/> */}
            <main className="pt-20">
              <AdminPage/>
            </main>
        </AdminModalProvider>
    )
}