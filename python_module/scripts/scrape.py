import requests
from bs4 import BeautifulSoup
import csv

base_url = 'https://www.futwiz.com/en/fc24/players?page='
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

def get_player_data(page):
    url = f'{base_url}{page}&release[]=raregold&release[]=commongold&minprice=350'
    response = requests.get(url, headers=headers)
    soup = BeautifulSoup(response.content, 'html.parser')
    
    players = []
    main_content = soup.find('div', class_='main-content-body')
    if main_content:
        content_row = main_content.find('div', class_='content-row-100 flexbox flexwrap gap40 mb-20 latest-content')
        if content_row:
            player_search_left = content_row.find('div', class_='player-search-left')
            if player_search_left:
                player_search_results = player_search_left.find('div', class_='player-search-results')
                if player_search_results:
                    player_cards = player_search_results.find_all('a', class_='latest-player-card')
                    for card in player_cards:
                        player_data = {}
                        content = card.find('div', class_='latest-player-card-content')
                        if content:
                            player_data['rating'] = content.find('div', class_='card-24-pack-rating').text.strip() if content.find('div', class_='card-24-pack-rating') else None
                            player_data['position'] = content.find('div', class_='card-24-pack-position').text.strip() if content.find('div', class_='card-24-pack-position') else None
                            player_data['name'] = content.find('div', class_='card-24-pack-name').text.strip() if content.find('div', class_='card-24-pack-name') else None
                            skill_moves = content.find('div', class_='card-24-pack-extra-info-foot')
                            if skill_moves:
                                skill_moves = skill_moves.find('div', class_='card-24-pack-foot-txt')
                                if skill_moves:
                                    player_data['skill_moves'] = skill_moves.find('span', class_='card-24-pack-sm').text.strip() if skill_moves.find('span', class_='card-24-pack-sm') else None
                            weak_foot = content.find('div', class_='card-24-pack-extra-info-foot')
                            if weak_foot:
                                weak_foot = weak_foot.find('div', class_='card-24-pack-foot-txt')
                                if weak_foot:
                                    player_data['weak_foot'] = weak_foot.find('span', class_='card-24-pack-wf').text.strip() if weak_foot.find('span', class_='card-24-pack-wf') else None
                        info_block = card.find('div', class_='latest-player-info-block')
                        if info_block:
                            price_block = info_block.find('div', class_='latest-player-info-price')
                            if price_block:
                                player_data['price'] = price_block.find('span', class_='console-price').text.strip() if price_block.find('span', class_='console-price') else None
                        players.append(player_data)
    return players

def save_to_csv(players, filename='players_data.csv'):
    keys = players[0].keys() if players else []
    with open(filename, 'w', newline='', encoding='utf-8') as file:
        dict_writer = csv.DictWriter(file, fieldnames=keys)
        dict_writer.writeheader()
        dict_writer.writerows(players)

all_players = []
for page in range(97):  # pages from 0 to 96
    # print(f'Scraping page {page}')
    page_data = get_player_data(page)
    all_players.extend(page_data)

save_to_csv(all_players)
print(f'Data saved in players_data.csv')
