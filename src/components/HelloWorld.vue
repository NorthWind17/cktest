<template>
  <div class="st_editor" ref="stEditor">
    <ckeditor
      ref="ckeditor"
      :value="editorData"
      :editor="editor"
      :config="editorConfig"
      :disabled="!isEdit"
      @ready="onReady"
      @input="onEditorInput"
      @destroy="onEditorDestroy"
      @blur="onBlurFn"
    ></ckeditor>
    <!-- <div class="stEditorCopy"></div> -->
  </div>
</template>

<script>
import CKEditor from '@ckeditor/ckeditor5-vue2'
import Editor from 'ckeditor5-custom-build/build/ckeditor'
import axios from 'axios'
import Vue from 'vue'

Vue.use(CKEditor) //全局注册
function MentionCustomization(editor) {
  // The upcast converter will convert view <a class="mention" href="" data-user-id="">
  // elements to the model 'mention' text attribute.
  editor.conversion.for('upcast').elementToAttribute({
    view: {
      name: 'span',
      key: 'data-mention',
      classes: 'mention',
      attributes: {
        'data-user-id': true
      }
    },
    model: {
      key: 'mention',
      value: (viewItem) => {
        // The mention feature expects that the mention attribute value
        // in the model is a plain object with a set of additional attributes.
        // In order to create a proper object use the toMentionAttribute() helper method:
        const mentionAttribute = editor.plugins
          .get('Mention')
          .toMentionAttribute(viewItem, {
            // Add any other properties that you need.
            userId: viewItem.getAttribute('data-user-id')
          })

        return mentionAttribute
      }
    },
    converterPriority: 'high' // 覆盖原有的模式
  })

  // Downcast the model 'mention' text attribute to a view <a> element.
  editor.conversion.for('downcast').attributeToElement({
    model: 'mention',
    view: (modelAttributeValue, { writer }) => {
      // console.log('modelAttributeValue===>', modelAttributeValue);
      // Do not convert empty attributes (lack of value means no mention).
      if (!modelAttributeValue) {
        return
      }
      return writer.createAttributeElement(
        'span',
        {
          class: 'mention',
          'data-mention': modelAttributeValue.id,
          'data-user-id': modelAttributeValue.userId
        },
        {
          // Make mention attribute to be wrapped by other attribute elements.
          priority: 20,
          // Prevent merging mentions together.
          id: modelAttributeValue.uid
        }
      )
    },
    converterPriority: 'high'
  })
}

function someFnOnCkEditorReadyState(editor) {
  // as for img tag the options supported by ckeditor is very limited, we must define our properties to extend the used schema
  editor.model.schema.extend('img', { allowAttributes: ['data-mathml'] })

  // add conversion for downcast
  editor.conversion
    .for('downcast')
    .add(modelToViewAttributeConverter('data-mathml'))

  // add conversion for upcast
  editor.conversion.for('upcast').attributeToAttribute({
    view: {
      name: 'image',
      key: 'data-mathml'
    },
    model: 'data-mathml'
  })
}

class MyUploadAdapter {
  constructor(loader) {
    // Save Loader instance to update upload progress.
    // console.log(loader)
    this.loader = loader
  }

  async upload() {
    const data = new FormData()
    // data.append('typeOption', 'upload_image');
    data.append('file', await this.loader.file)
    data.append('entityId', 0)
    data.append('entityType', 6)
    data.append('functionType', 7)
    data.append('functionId', 1)
  }
}

export default {
  name: 'StEditorCopy',
  props: {
    // 使用editorHtml.sync
    editorHtml: {
      type: String
    },
    placeholder: {
      type: String,
      default: '请输入'
    },
    // 是否加载提及
    isMention: {
      type: Boolean,
      default: true
    },
    // 是否加载菜单栏
    isShowToolBar: {
      type: Boolean,
      default: true
    },
    // 是否可编辑
    isEdit: {
      type: Boolean,
      default: true
    },
    //是否在销毁时提交
    isNeedSub: {
      type: Boolean,
      default: false
    },
    fileInfo: {
      type: Object,
      default: () => {}
    }
  },
  components: {
    CKEditor,
    ckeditor: CKEditor.component
  },
  data() {
    return {
      hideEditor: false,
      editor: Editor,
      editorData: this.editorHtml || undefined,
      editorInstance: null,
      editorConfig: {
        // width: '400px',
        placeholder: this.placeholder,
        language: 'zh-cn',
        toolbar: [
          'heading',
          '|',
          'fontColor',
          'underline',
          'fontSize',
          'fontBackgroundColor',
          'fontFamily',
          'highlight',
          '|',
          'alignment',
          'bold',
          'italic',
          'outdent',
          'indent',
          'link',
          'bulletedList',
          'numberedList',
          'todoList',
          '|',

          'imageUpload',
          'insertFile',
          'blockQuote',
          'insertTable',
          // 'code',
          'codeBlock',
          '|',
          'undo',
          'redo'
        ],
        fontFamily: {
          options: [
            'default',
            '宋体',
            '新宋体',
            '仿宋',
            '楷体',
            '微软雅黑',
            '黑体',
            '华文仿宋',
            '华文楷体',
            '华文隶书',
            '华文宋体',
            '华文细黑',
            '华文新魏',
            '华文行楷',
            '华文中宋',
            '隶书',
            '苹方 常规',
            '幼圆'
          ]
        },
        fontSize: {
          options: [10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36]
        },
        image: {
          toolbar: [
            'imageTextAlternative',
            'toggleImageCaption',
            'imageStyle:inline',
            'imageStyle:block',
            'imageStyle:side',
            'linkImage'
          ]
          // insert: {
          //   type: 'inline'
          //   // type?: 'inline' | 'block' | 'auto';
          // }
          // styles: {
          //   // Defining custom styling options for the images.
          //   options: [
          //     {
          //       name: 'inline',
          //       className: 'aaaaa'
          //     }
          //   ]
          // }
        },
        table: {
          contentToolbar: [
            'tableColumn',
            'tableRow',
            'mergeTableCells',
            'tableCellProperties',
            'tableProperties'
          ]
        },
        htmlEmbed: {
          showPreviews: true
        },

        htmlSupport: {
          allow: [
            {
              name: /.*/,
              attributes: true,
              classes: true,
              styles: true
            }
          ]
        }
        // mention: {
        //   feeds: this.isMention && [
        //     {
        //       marker: '@',
        //       minimumCharacters: 1,
        //       feed: this.getFeedItems,
        //       itemRenderer: this.customItemRenderer
        //     }
        //   ]
        // },
        // MentionCustomization: ''

        // link: {
        //   addTargetToExternalLinks: true

        //   // // Let the users control the "download" attribute of each link.
        //   // decorators: [
        //   //     {
        //   //         mode: 'manual',
        //   //         label: 'Downloadable',
        //   //         attributes: {
        //   //             download: 'download'
        //   //         }
        //   //     }
        //   // ]
        // },
      },
      editorDom: null
    }
  },
  computed: {
    userList() {
      return _.map(this.$store.getters['GET_USERLIST'], (e) => {
        return {
          id: `@${e.name}`,
          userId: e.id,
          name: e.name,
          avatar: e.avatar,
          position: e.position
        }
      })
    }
  },
  watch: {},
  created() {},
  async mounted() {
    let config = {
      placeholder: this.placeholder,
      language: 'zh-cn',
      toolbar: [
        'heading',
        '|',
        'fontColor',
        'underline',
        'fontSize',
        'fontBackgroundColor',
        'fontFamily',
        'highlight',
        '|',
        'alignment',
        'bold',
        'italic',
        'outdent',
        'indent',
        'link',
        'bulletedList',
        'numberedList',
        'todoList',
        '|',

        'imageUpload',
        'insertFile',
        'blockQuote',
        'insertTable',
        // 'code',
        'codeBlock',
        '|',
        'undo',
        'redo'
      ],
      fontFamily: {
        options: [
          'default',
          '宋体',
          '新宋体',
          '仿宋',
          '楷体',
          '微软雅黑',
          '黑体',
          '华文仿宋',
          '华文楷体',
          '华文隶书',
          '华文宋体',
          '华文细黑',
          '华文新魏',
          '华文行楷',
          '华文中宋',
          '隶书',
          '苹方 常规',
          '幼圆'
        ]
      },
      fontSize: {
        options: [10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36]
      },
      image: {
        toolbar: [
          'imageTextAlternative',
          'toggleImageCaption',
          'imageStyle:inline',
          'imageStyle:block',
          'imageStyle:side',
          'linkImage'
        ]
        // insert: {
        //   type: 'inline'
        //   // type?: 'inline' | 'block' | 'auto';
        // }
        // styles: {
        //   // Defining custom styling options for the images.
        //   options: [
        //     {
        //       name: 'inline',
        //       className: 'aaaaa'
        //     }
        //   ]
        // }
      },
      table: {
        contentToolbar: [
          'tableColumn',
          'tableRow',
          'mergeTableCells',
          'tableCellProperties',
          'tableProperties'
        ]
      },
      htmlEmbed: {
        showPreviews: true
      },

      htmlSupport: {
        allow: [
          {
            name: /.*/,
            attributes: true,
            classes: true,
            styles: true
          }
        ]
      }
      // mention: {
      //   feeds: this.isMention && [
      //     {
      //       marker: '@',
      //       minimumCharacters: 1,
      //       feed: this.getFeedItems,
      //       itemRenderer: this.customItemRenderer
      //     }
      //   ]
      // },
      // MentionCustomization: ''

      // link: {
      //   addTargetToExternalLinks: true

      //   // // Let the users control the "download" attribute of each link.
      //   // decorators: [
      //   //     {
      //   //         mode: 'manual',
      //   //         label: 'Downloadable',
      //   //         attributes: {
      //   //             download: 'download'
      //   //         }
      //   //     }
      //   // ]
      // },
    }
    await this.$nextTick()
    // ClassicEditor.create(document.querySelector('.stEditorCopy'), config)
    //   .then((editor) => {
    //     window.editor = editor
    //   })
    //   .catch((error) => {
    //     console.error('Oops, something went wrong!')
    //     console.error(
    //       'Please, report the following error on https://github.com/ckeditor/ckeditor5/issues with the build id and the error stack trace:'
    //     )
    //     console.warn('Build id: w2x4hsrl3dlt-xws7pn8ntdyc')
    //     console.error(error)
    //   })
  },
  beforeDestroy() {},
  destroyed() {
    this.onEditorDestroy()
  },
  methods: {
    //  数据延迟调用去赋值==
    setData() {
      this.editorData = this.editorHtml
    },
    setEdit() {},
    onReady(editor) {
      // console.log('editor onReady', editor.plugins)
      this.editorDom = editor
      this.editorInstance = editor.$_instance
      editor.ui.view.on('render', () => {
        // 使用一个微小的延时让编辑器完全渲染，然后触发重绘
        setTimeout(() => {
          window.getComputedStyle(document.body).getPropertyValue('display')
        })
      })
      // 挂在选择后回显
      // MentionCustomization(editor)
      // someFnOnCkEditorReadyState(editor)
      editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
        return new MyUploadAdapter(loader)
      }
    },
    getFeedItems(queryText) {
      // console.log('getFeedItems', queryText, this.userList)
      if (queryText.indexOf(' ') !== -1) {
        return
      }
      // As an example of an asynchronous action, return a promise
      // that resolves after a 100ms timeout.
      // This can be a server request or any sort of delayed action.
      return new Promise((resolve) => {
        setTimeout(() => {
          const itemsToDisplay = this.userList
            // Filter out the full list of all items to only those matching the query text.
            .filter(isItemMatching)
            // Return 10 items max - needed for generic queries when the list may contain hundreds of elements.
            .slice(0, 10)

          resolve(itemsToDisplay)
        }, 100)
      })

      function isItemMatching(item) {
        // Make the search case-insensitive.
        const searchString = queryText.toLowerCase()

        // Include an item in the search results if the name or username includes the current user input.
        return (
          item.name.toLowerCase().includes(searchString) ||
          item.id.toLowerCase().includes(searchString)
        )
      }
    },
    customItemRenderer(item) {
      // console.log(item);
      const itemElement = document.createElement('div')
      itemElement.classList.add('mention__item')

      //
      const avatar = document.createElement('img')
      avatar.classList.add('mention__item__user-avatar')
      avatar.src = item.avatar
      itemElement.appendChild(avatar)

      //
      const userNameElement = document.createElement('span')
      userNameElement.classList.add('mention__item__user-name')
      userNameElement.textContent = item.name
      itemElement.appendChild(userNameElement)

      //
      const positionElement = document.createElement('span')
      positionElement.classList.add('mention__item__user-position')
      positionElement.textContent = item.position ? `/${item.position}` : ''

      itemElement.appendChild(positionElement)

      return itemElement
    },
    onEditorInput(html) {
      this.$emit('update:editorHtml', html)
      this.$emit('change', html)
    },
    onBlurFn() {
      this.$emit('onBlur')
    },
    onEditorDestroy() {
      // console.log(arguments)
    }
  }
}
</script>

<style lang="scss">
.st_editor {
  width: 100%;
  ul,
  li {
    margin: inherit;
    padding: inherit;
  }

  .ck-editor {
    .ck.ck-editor__editable_inline {
    }
    .ck-toolbar__items {
      .ck-font-size-dropdown {
        .ck-dropdown__panel {
          .ck-list {
            max-height: 200px;
            overflow-y: auto;
            overflow-y: overlay;
          }
        }
      }
    }
  }

  .mention__item {
    .mention__item__user- {
      &avatar {
        border-radius: 100%;
        height: 30px;
        width: 30px;
      }
      &name {
        margin-left: 0.5rem;
      }
      &position {
        font-size: 12px;
      }
    }
  }
}
:root {
  --ck-color-button-on-color: #7b68ee;
}
</style>
