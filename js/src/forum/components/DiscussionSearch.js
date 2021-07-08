import Search from 'flarum/forum/components/Search';
import ItemList from 'flarum/common/utils/ItemList';
import DiscussionSearchSource from './DiscussionSearchSource';

export default class DiscussionSearch extends Search {
    view() {
        this.hasFocus = true;

        const vdom = super.view();
        vdom.attrs.className = `SplitPosts-Search ${this.state.getValue() && 'open'} ` + vdom.attrs.className.replace(/(focused|open)/g, '');

        return vdom;
    }

    sourceItems() {
        const items = new ItemList();
        items.add('discussions', new DiscussionSearchSource(this.attrs.onSelect, this.attrs.ignore));

        return items;
    }
}
