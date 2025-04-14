import { Redirect } from 'expo-router';

export default function Index() {
  //If user is not already signed in
  return <Redirect href="/homescreen" />;
  //If user is already signed in (add later)
}
