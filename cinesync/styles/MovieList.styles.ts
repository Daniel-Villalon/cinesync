import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: '#1C1C1E',
    overflow: 'hidden',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTabButton: {
    backgroundColor: '#2C2C2E',
  },
  tabText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#F7EEDB',
    fontWeight: '600',
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F7EEDB',
    marginBottom: 8,
  },
  movieCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  poster: {
    width: 100,
    height: 150,
    backgroundColor: '#333',
  },
  infoContainer: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    color: '#F7EEDB',
    fontWeight: '600',
    flex: 1,
  },
  removeButton: {
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeIcon: {
    color: '#FF6B6B',
    fontSize: 30,
    fontWeight: 'bold',
  },
  genre: {
    fontSize: 14,
    color: '#F7EEDB',
    marginTop: 4,
  },
  user: {
    fontSize: 14,
    color: '#F7EEDB',
    marginTop: 2,
  },
  votesContainer: {
    flexDirection: 'row',
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftVoteButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  seenButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  voteIcon: {
    width: 24,
    height: 24,
    marginRight: 6,
  },
  voteCount: {
    color: '#F7EEDB',
    fontSize: 14,
  },
  activeVoteCount: {
    color: '#FFD700',
    fontWeight: 'bold',
  },
  ratingContainer: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingSelectorContainer: {
    flex: 1,
  },
  ratingLabel: {
    fontSize: 14,
    color: '#F7EEDB',
  },
  ratingSelector: {
    flexDirection: 'row',
    marginTop: 4,
  },
  starButton: {
    marginRight: 8,
  },
  starText: {
    fontSize: 24,
    color: '#AAAAAA',
  },
  selectedStar: {
    color: '#FFD700',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#aaa',
  },
  ratingText: {
    fontSize: 14,
    color: '#F7EEDB',
    marginTop: 2,
    marginBottom: 4,
  },
  seenContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  watchCountText: {
    color: '#F7EEDB',
    fontSize: 14,
  },
  ratingDisplay: {
    color: '#FFD700',
    fontSize: 18,
    marginTop: 4,
  },
}); 