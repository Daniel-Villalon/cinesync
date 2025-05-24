import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#242423',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2B2C5A',
  },
  content: {
    padding: 16,
  },
  poster: {
    width: '100%',
    height: 400,
    marginBottom: 16,
    borderRadius: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#F7EEDB',
    marginBottom: 8,
    textAlign: 'center',
  },
  info: {
    fontSize: 16,
    color: '#F7EEDB',
    marginBottom: 4,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F7EEDB',
    marginTop: 16,
    marginBottom: 4,
  },
  ratingsContainer: {
    marginTop: 12,
  },
  ratingText: {
    fontSize: 14,
    color: '#F7EEDB',
    marginBottom: 2,
  },
  plot: {
    fontSize: 14,
    color: '#F7EEDB',
    marginTop: 12,
    textAlign: 'justify',
  },
  errorText: {
    color: '#FF5555',
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 16,
  },
  backButton: {
    backgroundColor: '#F6C343',
    padding: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  backButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  starContainer: {
    flexDirection: 'row',
    marginVertical: 8,
  },
  star: {
    fontSize: 28,
    marginHorizontal: 4,
  },
  addButton: {
    backgroundColor: '#F6C343',
    padding: 12,
    borderRadius: 8,
    alignSelf: 'center',
    marginVertical: 16,
  },
  addButtonText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 16,
  },
}); 