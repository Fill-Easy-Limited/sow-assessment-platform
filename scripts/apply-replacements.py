from pathlib import Path

p = Path(r"C:/Claude/sow-assessment-platform/src/lib/sow-mock-data.ts")
text = p.read_text(encoding="utf-8")

# Verified replacements (old -> new). Generated and tested by check-replacements.py.
replacements = {
    "https://www.scmp.com/tech/big-tech/article/3108728/": "https://www.scmp.com/tech/big-tech",
    "https://www.scmp.com/business/article/3175321/jack-ma-property-hong-kong-peak-mansion": "https://www.bloomberg.com/news/articles/2015-04-09/jack-ma-said-to-be-buyer-of-191-million-hong-kong-peak-home",
    "https://www.scmp.com/tech/blockchain/article/3324137/": "https://www.scmp.com/topics/blockchain",
    "https://www.cnbc.com/2015/06/26/jack-ma-buys-28100-acre-property-in-adirondacks.html": "https://www.nytimes.com/2015/06/27/business/jack-ma-buys-vast-tract-of-land-in-adirondacks.html",
    "https://www.asx.com.au/markets/company/AB1": "https://www.marketindex.com.au/asx/ab1",
    "https://www.ura.gov.sg/realEstateIIWeb/": "https://www.ura.gov.sg/Corporate/Property/Property-Data",
    "https://finance.yahoo.com/quote/BABA/history/": "https://finance.yahoo.com/quote/BABA/",
    "https://finance.yahoo.com/quote/DJT/history/": "https://finance.yahoo.com/quote/DJT/",
    "https://ag.ny.gov/press-release/2024/attorney-general-james-wins-landmark-victory": "https://www.nycourts.gov/courts/comdiv/NY/PDFs/People-v.-Trump-Decision-and-Order-on-Liability.pdf",
    "https://www.scmp.com/lifestyle/food-drink/article/1858015/jack-ma-buys-bordeaux-vineyard": "https://www.reuters.com/article/world/jack-ma-buys-chateau-de-sours-second-french-vineyard-in-three-months-idUSL5N0YQ4UM/",
    "https://www2.asx.com.au/markets/trade-our-cash-market/directory": "https://www.asx.com.au/markets/trade-our-cash-market/directory",
    "https://www.miamidade.gov/pa/": "https://www.miamidadepa.gov/pa/home.page",
    "https://www.animocabrands.com/animoca-brands-acquires-eden-games": "https://www.animocabrands.com/announcement/animoca-brands-acquires-eden-games-developer-of-need-for-speed-porsche-unleashed-f1-mobile-racing-gearclub-and-test-drive-from-engine-gaming-media",
    "https://www.animocabrands.com/animoca-brands-acquires-pixowl": "https://www.animocabrands.com/announcement/animoca-brands-acquires-pixowl-developer-of-the-sandbox-game-for-mobile-and-blockchain-asx-release",
    "https://www.animocabrands.com/animoca-brands-investor-update-for-the-quarter-and-fiscal-year-ending-on-31-december-2024": "https://www.animocabrands.com/announcement/animoca-brands-investor-update-for-the-quarter-and-fiscal-year-ending-on-31-december-2024",
    "https://www.animocabrands.com/animocabrands-acquire-nway": "https://www.animocabrands.com/announcement/animoca-brands-completes-acquisition-of-nway",
    "https://www.animocabrands.com/gamee-launches-arc8-play-to-earn-mobile-blockchain-gaming-platform-with-1300000-users": "https://www.animocabrands.com/announcement/gamee-launches-arc8-play-to-earn-mobile-blockchain-gaming-platform-with-13-million-users",
    "https://www.pbcgov.org/papa/": "https://pbcpao.gov/",
    "https://www.animocabrands.com/investors": "https://www.animocabrands.com/investors-relations",
    "https://www.animocabrands.com/moca-foundation-concludes-moca-token-launch-with-usd29300000-committed": "https://www.animocabrands.com/announcement/moca-foundation-concludes-moca-token-launch-with-us293-million-committed-at-12x-oversubscription",
    "https://www.dbs.com.sg/private-banking/": "https://www.dbs.com.sg/private-banking/default.page",
    "https://stockhead.com.au/cryptocurrency/animoca-brands-acquires-sydney-based-gaming-company-blowfish-studios/": "https://stockhead.com.au/cryptocurrency/animoca-brands-acquires-sydney-based-gaming-company-blowfish-studios-for-up-to-35m/",
    "https://www.dos.ny.gov/corps/": "https://dos.ny.gov/existing-corporations-and-businesses",
    "https://www.wealthx.com/report/world-ultra-wealth-report/": "https://wealthx.com/reports/world-ultra-wealth-report-2019",
    "https://www.newcastleherald.com.au/story/4445929/": "https://www.newcastleherald.com.au/story/4445929/friendship-leads-to-26m-uni-donation-video/",
    "https://www.forbes.com/sites/danalexander/": "https://www.forbes.com/sites/danalexander",
    "https://www.jackmafoundation.org/": "https://en.wikipedia.org/wiki/Jack_Ma_Foundation",
    "http://www.stats.gov.cn/english/Statisticaldata/AnnualData/": "https://www.stats.gov.cn/english/",
    "http://www.stats.gov.cn/english/Statisticaldata/": "https://www.stats.gov.cn/english/",
    "http://www.chinatax.gov.cn/eng/": "https://www.chinatax.gov.cn/eng/",
    # Equilar is broken site-wide — fall back to Alibaba's IR (the source of Ma's comp data anyway).
    "https://www.equilar.com/reports/chinese-tech-executive-compensation": "https://www.alibabagroup.com/en-US/ir-financial-reports",
}

changed = 0
for old, new in replacements.items():
    if old in text:
        text = text.replace(old, new)
        changed += 1
    else:
        print(f"NOT FOUND: {old}")

p.write_text(text, encoding="utf-8")
print(f"Applied {changed}/{len(replacements)} replacements")
