const Table = React.createClass({

    // getInitialState: function () {
    //     return {data: this.props.initialData};
    // },

    propTypes: {
        headers: React.PropTypes.arrayOf(React.PropTypes.string),
        initialData: React.PropTypes.arrayOf(React.PropTypes.arrayOf(React.PropTypes.string)),
    },

    getInitialState: function() {
        return {
            data: this.props.initialData,
            sortby: null,
            descending: false,
            edit: null,
            search: false,
            descending:false
        };
    },

    sorting: function(inputNumber){
      let column = inputNumber.target.cellIndex;
      let data = this.state.data.slice();
      let descending = this.state.sortby === column && !this.state.descending;
        data.sort(function(a, b) {
            return descending
                ? (a[column] < b[column] ? 1 : -1)
                : (a[column] > b[column] ? 1 : -1);
        });
        this.setState({
            data: data,
            sortby:column,
        });
    },

    edit: function(editing){
        this.setState({edit:{
            row:parseInt(editing.target.dataset.row, 10),
            cell: editing.target.cellIndex
        }})
    },

    save: function(e){
        e.preventDefault();
        let input = e.target.firstChild;
        let Data = this.state.data.slice;
        data[this.state.edit.row][this.state.edit.cell] = input.value;
        this.setState({
            edit: null,
            data: data,
        });
    },


    render: function() {
        return (
            React.DOM.div(null,
                this._renderToolbar(),
                this._renderTable()
            )
        );
    },

    _renderToolbar: function() {
        return  React.DOM.div({className: 'toolbar'},
            React.DOM.button({
                onClick: this._toggleSearch,
            }, 'Search'),
            React.DOM.a({
                onClick: this._download.bind(this, 'json'),
                href: 'data.json',
            }, 'Export JSON'),
            React.DOM.a({
                onClick: this._download.bind(this, 'csv'),
                href: 'data.csv',
            }, 'Export CSV')
        );
    },

    _preSearchData: null,

    _toggleSearch: function() {
        if (this.state.search) {
            this.setState({
                data: this._preSearchData,
                search: false,
            });
            this._preSearchData = null;
        } else {
            this._preSearchData = this.state.data;
            this.setState({
                search: true,
            });
        }
    },

    _log: [],

    _logSetState: function(newState) {
        // remember the old state in a clone
        this._log.push(JSON.parse(JSON.stringify(
            this._log.length === 0 ? this.state : newState
        )));
        this.setState(newState);
    },

    _replay: function() {
        if (this._log.length === 0) {
            console.warn('No state to replay yet');
            return;
        }
        let number = -1;
        let interval = setInterval(function() {
            number++;
            if (number === this._log.length - 1) { // the end
                clearInterval(interval);
            }
            this.setState(this._log[number]);
        }.bind(this), 1000);
    },

    componentDidMount: function() {
        document.onkeydown = function(e) {
            if (e.altKey && e.shiftKey && e.keyCode === 82) { // ALT+SHIFT+R(eplay)
                this._replay();
            }
        }.bind(this);
    },

    _download: function(format, ev) {
        var contents = format === 'json'
            ? JSON.stringify(this.state.data)
            : this.state.data.reduce(function(result, row) {
                return result
                    + row.reduce(function(rowresult, cell, number) {
                        return rowresult
                            + '"'
                            + cell.replace(/"/g, '""')
                            + '"'
                            + (number < row.length - 1 ? ',' : '');
                    }, '')
                    + "\n";
            }, '');

        var URL = window.URL || window.webkitURL;
        var blob = new Blob([contents], {type: 'text/' + format});
        ev.target.href = URL.createObjectURL(blob);
        ev.target.download = 'data.' + format;
    },

    _search: function(e) {
        var needle = e.target.value.toLowerCase();
        if (!needle) {
            this.setState({data: this._preSearchData});
            return;
        }
        var idx = e.target.dataset.idx;
        var searchdata = this._preSearchData.filter(function(row) {
            return row[idx].toString().toLowerCase().indexOf(needle) > -1;
        });
        this.setState({data: searchdata});
    },

    renderSearch: function() {
        if (!this.state.search) {
            return null;
        }
        return (
            React.DOM.tr({onChange: this._search},
                this.props.headers.map(function(_ignore, number) {
                    return React.DOM.td({key: number},
                        React.DOM.input({
                            type: 'text',
                            'data-idx': number,
                        })
                    );
                })
            )
        );
    },

    _renderTable: function() {
        return (
            React.DOM.table(null,
                React.DOM.thead({onClick: this.sorting},
                    React.DOM.tr(null,
                        this.props.headers.map(function(title, number) {
                            if(this.state.sortby === number){
                                title += this.state.descending ? ' \u2191' : ' \u2193'
                            }
                            return React.DOM.th({key: number}, title);
                        }, this)
                    )
                ),
                React.DOM.tbody({onDoubleClick: this.edit},
                    this.renderSearch(),
                    this.state.data.map(function(row, rowidx) {
                        return (
                            React.DOM.tr({key: rowidx},
                                row.map(function(cell, number) {
                                    let content = cell;
                                    let edit = this.state.edit;
                                    if (edit && edit.row === rowidx && edit.cell === number) {
                                        content = React.DOM.form({onSubmit: this.save},
                                            React.DOM.input({
                                                type: 'text',
                                                defaultValue: cell,
                                            })
                                        );
                                    }

                                    return React.DOM.td({
                                        key: number,
                                        'data-row': rowidx,
                                    }, content);
                                }, this)
                            )
                        );
                    }, this)
                )
            )
        );
    }
});

const headers = [
    "Book", "Author", "Language", "Published", "Sales"
];

const data = [
    ["The Lord of the Rings", "J. R. R. Tolkien", "English", "1954–1955", "150 million"],
    ["Le Petit Prince (The Little Prince)", "Antoine de Saint-Exupéry", "French", "1943", "140 million"],
    ["Harry Potter and the Philosopher's Stone", "J. K. Rowling", "English", "1997", "107 million"],
    ["And Then There Were None", "Agatha Christie", "English", "1939", "100 million"],
    ["Dream of the Red Chamber", "Cao Xueqin", "Chinese", "1754–1791", "100 million"],
    ["The Hobbit", "J. R. R. Tolkien", "English", "1937", "100 million"],
    ["She: A History of Adventure", "H. Rider Haggard", "English", "1887", "100 million"],
];

ReactDOM.render(
    React.createElement(Table, {
        headers: headers,
        initialData: data,
    }),
    document.getElementById("div1")
);