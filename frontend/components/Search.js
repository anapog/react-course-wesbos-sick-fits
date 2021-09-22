/* eslint-disable react/jsx-props-no-spreading */
import { useRouter } from 'next/dist/client/router';
import gql from 'graphql-tag';
import { resetIdCounter, useCombobox } from 'downshift';
import { useLazyQuery } from '@apollo/client';
import debounce from 'lodash.debounce';
import { DropDown, DropDownItem, SearchStyles } from './styles/DropDown';

const SEARCH_PRODUCTS_QUERY = gql`
  query SEARCH_PRODUCTS_QUERY($searchTerm: String!) {
    searchTerms: allProducts(
      where: {
        OR: [
          { name_contains_i: $searchTerm }
          { description_contains_i: $searchTerm }
        ]
      }
    ) {
      id
      name
      photo {
        image {
          publicUrlTransformed
        }
      }
    }
  }
`;

export default function Search() {
  const [findItems, { data, loading }] = useLazyQuery(SEARCH_PRODUCTS_QUERY, {
    fetchPolicy: 'no-cache',
  });
  const findItemsDebounced = debounce(findItems, 350);
  const itemsFound = data?.searchTerms || [];
  const router = useRouter();

  resetIdCounter();
  const {
    isOpen,
    inputValue,
    highlightedIndex,
    getMenuProps,
    getInputProps,
    getComboboxProps,
    getItemProps,
  } = useCombobox({
    items: itemsFound,
    onInputValueChange() {
      findItemsDebounced({ variables: { searchTerm: inputValue } });
    },
    onSelectedItemChange({ selectedItem }) {
      router.push({ pathname: `/product/${selectedItem.id}` });
    },
    itemToString: (item) => item.name || '',
  });

  return (
    <SearchStyles>
      <div {...getComboboxProps()}>
        <input
          {...getInputProps({
            type: 'search',
            placeholder: 'Search for an item',
            id: 'search',
            className: loading ? 'loading' : '',
          })}
        />
      </div>
      <DropDown {...getMenuProps()}>
        {isOpen &&
          itemsFound.map((item, index) => (
            <DropDownItem
              key={item.id}
              {...getItemProps({ item })}
              highlighted={index === highlightedIndex}
            >
              <img
                src={item.photo.image.publicUrlTransform}
                alt={item.name}
                width="50"
              />
              {item.name}
            </DropDownItem>
          ))}
        {isOpen && !itemsFound.length && !loading && (
          <DropDownItem>
            Sorry no items were found for {inputValue}
          </DropDownItem>
        )}
      </DropDown>
    </SearchStyles>
  );
}
