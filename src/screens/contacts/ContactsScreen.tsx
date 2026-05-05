import { useNavigation } from '@react-navigation/native';
import { ContactRow } from '../../components/lists/ContactRow';
import { NavHeader } from '../../components/ui/NavHeader';
import { Screen } from '../../components/ui/Screen';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { useAppState } from '../../core/AppProvider';

export function ContactsScreen() {
  const navigation = useNavigation<any>();
  const { scopedContacts } = useAppState();

  return (
    <Screen header={<NavHeader onBack={() => navigation.goBack()} subtitle="Agency, organizer, and vendor contacts" title="Contacts" />}>
      <SectionHeader title="Directory" caption="Health departments, fire marshals, cities, commissary, and organizers." />
      {scopedContacts.map((contact) => (
        <ContactRow key={contact.id} contact={contact} />
      ))}
    </Screen>
  );
}
