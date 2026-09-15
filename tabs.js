// Tab switching for the Products section (#products).
// Home-page category cards call UzTabs.goTo('subscriptions' | 'smm' | 'gemini')
// to both scroll to the Products section and activate the right tab.
const UzTabs = {
  activate(tabId) {
    document.querySelectorAll('#products-tabs .tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    document.querySelectorAll('.tab-panel').forEach(panel => {
      panel.classList.toggle('active', panel.id === 'tab-' + tabId);
    });
  },
  goTo(tabId) {
    this.activate(tabId);
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('#products-tabs .tab-btn').forEach(btn => {
    btn.addEventListener('click', () => UzTabs.activate(btn.dataset.tab));
  });
});
