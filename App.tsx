import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Animated,
  Share,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sharing from 'expo-sharing';

interface Quote {
  id: number;
  text: string;
  author: string;
  category: string;
}

const quotes: Quote[] = [
  {id: 1, text: '成功不是終點，失敗不是末日，重要的是繼續前進的勇氣。', author: '溫斯頓·邱吉爾', category: '勵志'},
  {id: 2, text: '生活就像騎自行車，要保持平衡，就必須不斷前進。', author: '愛因斯坦', category: '人生'},
  {id: 3, text: '今天是你餘生的第一天。', author: '無名氏', category: '勵志'},
  {id: 4, text: '夢想不會逃跑，會逃跑的永遠都是自己。', author: '無名氏', category: '夢想'},
  {id: 5, text: '每一個成功者都有一個開始。勇於開始，才能找到成功的路。', author: '無名氏', category: '成功'},
  {id: 6, text: '學習就像逆水行舟，不進則退。', author: '中國諺語', category: '學習'},
  {id: 7, text: '時間是最公正的裁判，它不會偏袒任何人。', author: '無名氏', category: '時間'},
  {id: 8, text: '相信自己，你比想像中更強大。', author: '無名氏', category: '自信'},
  {id: 9, text: '機會只偏愛有準備的頭腦。', author: '路易·巴斯德', category: '機會'},
  {id: 10, text: '今日事今日畢，明日又有明日事。', author: '無名氏', category: '效率'},
];

const categories = ['全部', '勵志', '人生', '夢想', '成功', '學習', '時間', '自信', '機會', '效率'];

const App = () => {
  const [currentQuote, setCurrentQuote] = useState<Quote>(quotes[0]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [fadeAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    loadFavorites();
    loadDailyQuote();
  }, []);

  const loadFavorites = async () => {
    try {
      const savedFavorites = await AsyncStorage.getItem('favorites');
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
    } catch (error) {
      console.log('載入收藏失敗:', error);
    }
  };

  const saveFavorites = async (newFavorites: number[]) => {
    try {
      await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
      setFavorites(newFavorites);
    } catch (error) {
      console.log('保存收藏失敗:', error);
    }
  };

  const loadDailyQuote = async () => {
    try {
      const today = new Date().toDateString();
      const savedDate = await AsyncStorage.getItem('dailyQuoteDate');
      const savedQuoteId = await AsyncStorage.getItem('dailyQuoteId');

      if (savedDate === today && savedQuoteId) {
        const quote = quotes.find(q => q.id === parseInt(savedQuoteId));
        if (quote) {
          setCurrentQuote(quote);
          return;
        }
      }

      // 產生今日金句
      const randomIndex = Math.floor(Math.random() * quotes.length);
      const todayQuote = quotes[randomIndex];
      setCurrentQuote(todayQuote);

      await AsyncStorage.setItem('dailyQuoteDate', today);
      await AsyncStorage.setItem('dailyQuoteId', todayQuote.id.toString());
    } catch (error) {
      console.log('載入每日金句失敗:', error);
    }
  };

  const getRandomQuote = () => {
    const filteredQuotes = selectedCategory === '全部' 
      ? quotes 
      : quotes.filter(q => q.category === selectedCategory);
    
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const newQuote = filteredQuotes[randomIndex];
    
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
    
    setCurrentQuote(newQuote);
  };

  const toggleFavorite = () => {
    const isFavorite = favorites.includes(currentQuote.id);
    let newFavorites;
    
    if (isFavorite) {
      newFavorites = favorites.filter(id => id !== currentQuote.id);
      Alert.alert('提示', '已從收藏中移除');
    } else {
      newFavorites = [...favorites, currentQuote.id];
      Alert.alert('提示', '已加入收藏');
    }
    
    saveFavorites(newFavorites);
  };

  const shareQuote = async () => {
    try {
      const message = `${currentQuote.text}\n\n— ${currentQuote.author}`;
      
      // 檢查是否支援分享功能
      if (await Sharing.isAvailableAsync()) {
        await Share.share({
          message: message,
          title: '分享金句',
        });
      } else {
        Alert.alert('提示', '此裝置不支援分享功能');
      }
    } catch (error) {
      console.log('分享失敗:', error);
      Alert.alert('錯誤', '分享失敗，請稍後再試');
    }
  };

  const isFavorite = favorites.includes(currentQuote.id);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2C3E50" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>每日金句</Text>
        <Text style={styles.headerSubtitle}>每天一句話，改變你的心境</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.categoryContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScrollView}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  selectedCategory === category && styles.selectedCategoryButton
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[
                  styles.categoryText,
                  selectedCategory === category && styles.selectedCategoryText
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <Animated.View style={[styles.quoteContainer, {opacity: fadeAnim}]}>
          <Text style={styles.quoteText}>{currentQuote.text}</Text>
          <Text style={styles.authorText}>— {currentQuote.author}</Text>
          <View style={styles.categoryTag}>
            <Text style={styles.categoryTagText}>{currentQuote.category}</Text>
          </View>
        </Animated.View>

        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={getRandomQuote}
          >
            <Text style={styles.actionButtonText}>🎲 隨機金句</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, isFavorite && styles.favoriteButton]}
            onPress={toggleFavorite}
          >
            <Text style={[styles.actionButtonText, isFavorite && styles.favoriteButtonText]}>
              {isFavorite ? '💖 已收藏' : '🤍 收藏'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={shareQuote}
          >
            <Text style={styles.actionButtonText}>📤 分享</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>📚 總共 {quotes.length} 句金句</Text>
          <Text style={styles.statsText}>💝 收藏了 {favorites.length} 句</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#2C3E50',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#BDC3C7',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  categoryContainer: {
    paddingVertical: 20,
  },
  categoryScrollView: {
    paddingHorizontal: 20,
  },
  categoryButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedCategoryButton: {
    backgroundColor: '#3498DB',
    borderColor: '#3498DB',
  },
  categoryText: {
    fontSize: 14,
    color: '#555555',
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
  },
  quoteContainer: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 25,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  quoteText: {
    fontSize: 18,
    lineHeight: 28,
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: '400',
  },
  authorText: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 10,
  },
  categoryTag: {
    alignSelf: 'center',
    backgroundColor: '#E8F4FD',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryTagText: {
    fontSize: 12,
    color: '#3498DB',
    fontWeight: '500',
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 25,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  favoriteButton: {
    backgroundColor: '#E74C3C',
    borderColor: '#E74C3C',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555555',
  },
  favoriteButtonText: {
    color: '#FFFFFF',
  },
  statsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  statsText: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 5,
  },
});

export default App;
