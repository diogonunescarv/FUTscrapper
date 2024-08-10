import requests
from bs4 import BeautifulSoup
import csv
import schedule
import time
from datetime import datetime
import os  # Adicionado para garantir que a pasta 'data' exista

base_url = 'https://www.futwiz.com/en/fc24/players?page='
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}
endpoint_url = 'http://localhost:3000/receive-data'  # Endpoint atualizado para localhost

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
                player_search_results = player_search_left.find('div', 'player-search-results')
                if player_search_results:
                    player_cards = player_search_results.find_all('a', class_='latest-player-card')
                    for card in player_cards:
                        player_data = {}
                        content = card.find('div', 'latest-player-card-content')
                        if content:
                            player_data['rating'] = content.find('div', 'card-24-pack-rating').text.strip() if content.find('div', 'card-24-pack-rating') else None
                            player_data['position'] = content.find('div', 'card-24-pack-position').text.strip() if content.find('div', 'card-24-pack-position') else None
                            player_data['name'] = content.find('div', 'card-24-pack-name').text.strip() if content.find('div', 'card-24-pack-name') else None
                            skill_moves = content.find('div', 'card-24-pack-extra-info-foot')
                            if skill_moves:
                                skill_moves = skill_moves.find('div', 'card-24-pack-foot-txt')
                                if skill_moves:
                                    player_data['skill_moves'] = skill_moves.find('span', 'card-24-pack-sm').text.strip() if skill_moves.find('span', 'card-24-pack-sm') else None
                            weak_foot = content.find('div', 'card-24-pack-extra-info-foot')
                            if weak_foot:
                                weak_foot = weak_foot.find('div', 'card-24-pack-foot-txt')
                                if weak_foot:
                                    player_data['weak_foot'] = weak_foot.find('span', 'card-24-pack-wf').text.strip() if weak_foot.find('span', 'card-24-pack-wf') else None
                        info_block = card.find('div', 'latest-player-info-block')
                        if info_block:
                            price_block = info_block.find('div', 'latest-player-info-price')
                            if price_block:
                                player_data['price'] = price_block.find('span', 'console-price').text.strip() if price_block.find('span', 'console-price') else None
                        players.append(player_data)
    return players

def save_to_csv(players, filename):
    # Certifique-se de que a pasta 'data' exista
    os.makedirs('data', exist_ok=True)
    filepath = os.path.join('data', filename)
    
    keys = players[0].keys() if players else []
    with open(filepath, 'w', newline='', encoding='utf-8') as file:
        dict_writer = csv.DictWriter(file, fieldnames=keys)
        dict_writer.writeheader()
        dict_writer.writerows(players)

def send_data_to_endpoint(data, endpoint):
    chunk_size = 500  # Define o tamanho do chunk
    for i in range(0, len(data), chunk_size):
        chunk = data[i:i + chunk_size]
        response = requests.post(endpoint, json=chunk)
        print(f'Status Code: {response.status_code}, Response: {response.text}')

def job():
    all_players = []
    for page in range(5):  # páginas de 0 a 96
        print(f'Starting scrape for page {page}')
        page_data = get_player_data(page)
        all_players.extend(page_data)
    
    filename = 'players_data.csv'
    save_to_csv(all_players, filename)
    print(f'Data saved in {filename}')
    
    send_data_to_endpoint(all_players, endpoint_url)
    print(f'Data sent to {endpoint_url}')

job()
schedule.every(3).minutes.do(job)

while True:
    schedule.run_pending()
    time.sleep(1)
